import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import { app } from 'electron';
import { join } from 'node:path';
import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'node:fs';
import { getDatabasePathManager, initializeDatabasePath, DatabaseConfig } from './config';

const isWindows = process.platform === 'win32';

let sqliteDb: SqlJsDatabase | null = null;
let saveQueue: Promise<void> = Promise.resolve();

// Функция для получения правильного пути к WASM
function getWasmPath(): string {
  // В development
  if (!app.isPackaged) {
    const devPath = join(__dirname, '../../node_modules/sql.js/dist/sql-wasm.wasm');
    console.log('[Database] Development WASM path:', devPath);
    
    if (existsSync(devPath)) {
      return devPath;
    }
    
    // Альтернативный путь в development
    const altDevPath = join(process.cwd(), 'node_modules/sql.js/dist/sql-wasm.wasm');
    console.log('[Database] Alternative development WASM path:', altDevPath);
    return altDevPath;
  }

  // В production - WASM должен быть скопирован рядом с app
  const prodPaths = [
    join(process.resourcesPath, 'sql-wasm.wasm'),
    join(process.resourcesPath, 'app.asar.unpacked', 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm'),
    join(__dirname, 'sql-wasm.wasm'),
    join(__dirname, '../sql-wasm.wasm'),
  ];

  for (const path of prodPaths) {
    console.log('[Database] Checking production WASM path:', path);
    if (existsSync(path)) {
      console.log('[Database] Found WASM at:', path);
      return path;
    }
  }

  console.error('[Database] WASM file not found in any of the expected locations');
  throw new Error('WASM file not found');
}

export async function initDatabase(config?: Partial<DatabaseConfig>) {
  try {
    console.log('[Database] Initializing database...');
    
    if (config) {
      initializeDatabasePath(config);
    }
    
    const pathManager = getDatabasePathManager();
    const dbPath = pathManager.getPath();
    
    console.log('[Database] Platform:', process.platform);
    console.log('[Database] DB path:', dbPath);
    console.log('[Database] Configuration:', pathManager.getConfig());
    console.log('[Database] Is packaged:', app.isPackaged);
    console.log('[Database] __dirname:', __dirname);
    console.log('[Database] process.cwd():', process.cwd());
    console.log('[Database] app.getAppPath():', app.getAppPath());

    const wasmPath = getWasmPath();
    console.log('[Database] Using WASM from:', wasmPath);

    if (!existsSync(wasmPath)) {
      throw new Error(`WASM file not found at: ${wasmPath}`);
    }

    const SQL = await initSqlJs({
      locateFile: (file) => {
        console.log('[Database] Locating file:', file);
        
        // Если запрашивается WASM файл, возвращаем найденный путь
        if (file.includes('sql-wasm.wasm')) {
          return wasmPath;
        }
        
        // Для других файлов (если есть)
        if (!app.isPackaged) {
          return join(__dirname, '../../node_modules/sql.js/dist', file);
        }
        
        return join(process.resourcesPath, file);
      }
    });

    let buffer: Uint8Array | undefined;
    
    if (existsSync(dbPath)) {
      console.log('[Database] Loading existing database');
      buffer = readFileSync(dbPath);
    } else {
      console.log('[Database] Creating new database');
    }

    sqliteDb = new SQL.Database(buffer);
    
    configureDatabaseOptimizations();
    createTables();
    setupAutoSave();

    console.log('[Database] Database initialized successfully');
    logDatabaseInfo();
    
  } catch (err) {
    console.error('[Database] Initialization error:', err);
    throw err;
  }
}

function configureDatabaseOptimizations() {
  if (!sqliteDb) return;

  try {
    sqliteDb.run('PRAGMA journal_mode = MEMORY');
    sqliteDb.run('PRAGMA synchronous = OFF');
    sqliteDb.run('PRAGMA cache_size = 10000');
    sqliteDb.run('PRAGMA temp_store = MEMORY');
    
    console.log('[Database] Optimizations applied');
  } catch (err) {
    console.error('[Database] Error applying optimizations:', err);
  }
}

function createTables() {
  if (!sqliteDb) {
    throw new Error('Database not initialized');
  }

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

  // Индексы
  sqliteDb.run(`CREATE INDEX IF NOT EXISTS idx_sensor_data_timestamp ON sensor_data(timestamp)`);
  sqliteDb.run(`CREATE INDEX IF NOT EXISTS idx_sensor_data_port ON sensor_data(port)`);
  sqliteDb.run(`CREATE INDEX IF NOT EXISTS idx_sensor_data_record_id ON sensor_data(record_id)`);
  sqliteDb.run(`CREATE INDEX IF NOT EXISTS idx_channel_data_sensor_id ON channel_data(sensor_data_id)`);
  sqliteDb.run(`CREATE INDEX IF NOT EXISTS idx_channel_data_channel ON channel_data(channel)`);
  sqliteDb.run(`CREATE INDEX IF NOT EXISTS idx_channel_data_timestamp ON channel_data(timestamp)`);

  console.log('[Database] Tables created successfully');
}

function setupAutoSave() {
  const saveInterval = isWindows ? 15000 : 10000;
  
  setInterval(() => {
    saveDatabaseAsync();
  }, saveInterval);

  app.on('before-quit', (event) => {
    event.preventDefault();
    console.log('[Database] Saving before quit...');
    saveDatabase();
    setTimeout(() => {
      app.exit(0);
    }, 1000);
  });
}

function saveDatabaseAsync() {
  saveQueue = saveQueue.then(() => saveDatabase());
}

export function saveDatabase() {
  if (!sqliteDb) {
    console.warn('[Database] Cannot save: database not initialized');
    return;
  }

  try {
    const pathManager = getDatabasePathManager();
    const dbPath = pathManager.getPath();
    
    const startTime = Date.now();
    const data = sqliteDb.export();
    
    if (isWindows) {
      writeFileSync(dbPath, Buffer.from(data), { flag: 'w' });
    } else {
      writeFileSync(dbPath, Buffer.from(data));
    }
    
    const duration = Date.now() - startTime;
    console.log(`[Database] Saved to disk in ${duration}ms`);
  } catch (err) {
    console.error('[Database] Save error:', err);
    
    setTimeout(() => {
      console.log('[Database] Retrying save...');
      saveDatabase();
    }, 1000);
  }
}

export function getDatabase(): SqlJsDatabase {
  if (!sqliteDb) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return sqliteDb;
}

export function exportDatabase(exportPath: string): boolean {
  if (!sqliteDb) {
    console.error('[Database] Cannot export: database not initialized');
    return false;
  }

  try {
    const data = sqliteDb.export();
    writeFileSync(exportPath, Buffer.from(data));
    console.log('[Database] Exported to:', exportPath);
    return true;
  } catch (err) {
    console.error('[Database] Export error:', err);
    return false;
  }
}

export async function importDatabase(importPath: string): Promise<boolean> {
  try {
    if (!existsSync(importPath)) {
      console.error('[Database] Import file does not exist:', importPath);
      return false;
    }

    const buffer = readFileSync(importPath);
    const wasmPath = getWasmPath();
    const SQL = await initSqlJs({
      locateFile: () => wasmPath
    });
    
    sqliteDb = new SQL.Database(buffer);
    configureDatabaseOptimizations();
    
    console.log('[Database] Imported from:', importPath);
    return true;
  } catch (err) {
    console.error('[Database] Import error:', err);
    return false;
  }
}

function logDatabaseInfo() {
  const pathManager = getDatabasePathManager();
  const config = pathManager.getConfig();
  const allPaths = pathManager.getAllPossiblePaths();
  
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║                    DATABASE CONFIGURATION                          ║');
  console.log('╠════════════════════════════════════════════════════════════════════╣');
  console.log(`║ Location Type: ${config.location.toUpperCase()}`);
  console.log(`║ Current Path: ${pathManager.getPath()}`);
  console.log('╠════════════════════════════════════════════════════════════════════╣');
  console.log('║                    AVAILABLE LOCATIONS                             ║');
  console.log('╠════════════════════════════════════════════════════════════════════╣');
  Object.entries(allPaths).forEach(([key, path]) => {
    console.log(`║ ${key.padEnd(12)}: ${path}`);
  });
  console.log('╚════════════════════════════════════════════════════════════════════╝');
}

export { sqliteDb };
