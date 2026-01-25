import type { Database as SqlJsDatabase } from 'sql.js';
import initSqlJs from 'sql.js';
import { app } from 'electron';
import { join } from 'node:path';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

import type { DatabaseConfig } from './config';
import { getDatabasePathManager, initializeDatabasePath } from './config';
import { logger } from '../logger/utils';

const isWindows = process.platform === 'win32';

let sqliteDb: SqlJsDatabase | null = null;
let saveQueue: Promise<void> = Promise.resolve();

/**
 * Функция для получения правильного пути к WASM
 */
function getWasmPath(): string {
  try {
    if (!app.isPackaged) {
      const devPaths = [
        join(__dirname, '../../../node_modules/sql.js/dist/sql-wasm.wasm'),
        join(process.cwd(), 'node_modules/sql.js/dist/sql-wasm.wasm'),
        join(__dirname, '../../../node_modules/sql.js/dist/sql-wasm.wasm'),
      ];

      for (const path of devPaths) {
        if (existsSync(path)) {
          logger.info(`[Database] Found development WASM at: ${path}`);
          return path;
        }
      }
    }

    const prodPaths = [
      join(process.resourcesPath, 'sql-wasm.wasm'),
      join(
        process.resourcesPath,
        'app.asar.unpacked',
        'node_modules',
        'sql.js',
        'dist',
        'sql-wasm.wasm',
      ),
      join(__dirname, 'sql-wasm.wasm'),
      join(__dirname, '../sql-wasm.wasm'),
    ];

    for (const path of prodPaths) {
      if (existsSync(path)) {
        logger.info(`[Database] Found production WASM at: ${path}`);
        return path;
      }
    }

    throw new Error('WASM file not found in any expected location');
  } catch (err) {
    logger.error(
      '[Database] WASM resolution error: ' + (err instanceof Error ? err.stack : String(err)),
    );
    throw err;
  }
}

/**
 * Инициализация базы
 */
export async function initDatabase(config?: Partial<DatabaseConfig>) {
  try {
    logger.info('[Database] Initializing...');

    if (config) initializeDatabasePath(config);

    const pathManager = getDatabasePathManager();
    const dbPath = pathManager.getPath();

    logger.info(`[Database] DB path: ${dbPath}`);
    logger.debug(`[Database] Config: ${JSON.stringify(pathManager.getConfig())}`);

    const wasmPath = getWasmPath();
    const SQL = await initSqlJs({
      locateFile: (file) =>
        file.includes('sql-wasm.wasm') ? wasmPath : join(process.resourcesPath, file),
    });

    let buffer: Uint8Array | undefined;
    if (existsSync(dbPath)) {
      logger.info('[Database] Loading existing database');
      buffer = readFileSync(dbPath);
    } else {
      logger.info('[Database] Creating new database');
    }

    sqliteDb = new SQL.Database(buffer);

    configureDatabaseOptimizations();
    createTables();
    setupAutoSave();

    logger.info('[Database] ✅ Initialized successfully');
  } catch (err) {
    logger.error(
      '[Database] ❌ Initialization error: ' + (err instanceof Error ? err.stack : String(err)),
    );
    throw err;
  }
}

/**
 * Настройка оптимизаций SQLite
 */
function configureDatabaseOptimizations() {
  if (!sqliteDb) return;
  try {
    sqliteDb.run('PRAGMA journal_mode = MEMORY');
    sqliteDb.run('PRAGMA synchronous = OFF');
    sqliteDb.run('PRAGMA cache_size = 10000');
    sqliteDb.run('PRAGMA temp_store = MEMORY');
    logger.debug('[Database] Optimizations applied');
  } catch (err) {
    logger.error(
      '[Database] Error applying optimizations: ' +
        (err instanceof Error ? err.stack : String(err)),
    );
  }
}

/**
 * Создание таблиц и индексов
 */
function createTables() {
  if (!sqliteDb) throw new Error('Database not initialized');

  sqliteDb.run(`
    CREATE TABLE IF NOT EXISTS sensor_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      record_id TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      time TEXT NOT NULL,
      port TEXT NOT NULL,
      raw_data TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )
  `);

  sqliteDb.run(`
    CREATE TABLE IF NOT EXISTS channel_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sensor_data_id INTEGER NOT NULL,
      channel INTEGER NOT NULL,
      value REAL NOT NULL,
      std_dev REAL,
      timestamp INTEGER NOT NULL,
      FOREIGN KEY (sensor_data_id) REFERENCES sensor_data(id)
    )
  `);

  sqliteDb.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      port TEXT NOT NULL,
      start_time INTEGER NOT NULL,
      end_time INTEGER,
      record_count INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active'
    )
  `);

  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_sensor_data_timestamp ON sensor_data(timestamp)',
    'CREATE INDEX IF NOT EXISTS idx_sensor_data_port ON sensor_data(port)',
    'CREATE INDEX IF NOT EXISTS idx_sensor_data_record_id ON sensor_data(record_id)',
    'CREATE INDEX IF NOT EXISTS idx_channel_data_sensor_id ON channel_data(sensor_data_id)',
    'CREATE INDEX IF NOT EXISTS idx_channel_data_channel ON channel_data(channel)',
    'CREATE INDEX IF NOT EXISTS idx_channel_data_timestamp ON channel_data(timestamp)',
  ];

  indexes.forEach((sql) => sqliteDb!.run(sql));

  logger.info('[Database] Tables and indexes created');
}

/**
 * Автосохранение
 */
function setupAutoSave() {
  const saveInterval = isWindows ? 15000 : 10000;

  setInterval(() => {
    saveDatabaseAsync();
  }, saveInterval);

  app.on('before-quit', (event) => {
    event.preventDefault();
    logger.info('[Database] Saving before quit...');
    saveDatabase();
    setTimeout(() => app.exit(0), 1000);
  });
}

function saveDatabaseAsync() {
  saveQueue = saveQueue.then(() => saveDatabase());
}

/**
 * Сохранение базы
 */
export function saveDatabase() {
  if (!sqliteDb) {
    logger.warn('[Database] Cannot save: not initialized');
    return;
  }

  try {
    const pathManager = getDatabasePathManager();
    const dbPath = pathManager.getPath();

    const startTime = Date.now();
    const data = sqliteDb.export();
    writeFileSync(dbPath, Buffer.from(data), { flag: 'w' });

    const duration = Date.now() - startTime;
    logger.info(`[Database] Saved in ${duration}ms`);
  } catch (err) {
    logger.error('[Database] Save error: ' + (err instanceof Error ? err.stack : String(err)));
    setTimeout(() => saveDatabase(), 1000);
  }
}

/**
 * Получение экземпляра базы
 */
export function getDatabase(): SqlJsDatabase {
  if (!sqliteDb) throw new Error('Database not initialized. Call initDatabase() first.');
  return sqliteDb;
}

/**
 * Экспорт базы
 */
export function exportDatabase(exportPath: string): boolean {
  if (!sqliteDb) return false;

  try {
    const data = sqliteDb.export();
    writeFileSync(exportPath, Buffer.from(data));
    logger.info('[Database] Exported to: ' + exportPath);
    return true;
  } catch (err) {
    logger.error('[Database] Export error: ' + (err instanceof Error ? err.stack : String(err)));
    return false;
  }
}

/**
 * Импорт базы
 */
export async function importDatabase(importPath: string): Promise<boolean> {
  try {
    if (!existsSync(importPath)) {
      logger.error('[Database] Import file does not exist: ' + importPath);
      return false;
    }

    const buffer = readFileSync(importPath);
    const wasmPath = getWasmPath();
    const SQL = await initSqlJs({ locateFile: () => wasmPath });

    sqliteDb = new SQL.Database(buffer);
    configureDatabaseOptimizations();

    logger.info('[Database] Imported from: ' + importPath);
    return true;
  } catch (err) {
    logger.error('[Database] Import error: ' + (err instanceof Error ? err.stack : String(err)));
    return false;
  }
}

export { sqliteDb };
