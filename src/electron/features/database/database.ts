// src/electron/features/database/database.ts

import type { Database as SqlJsDatabase } from 'sql.js';
import initSqlJs from 'sql.js';
import { app } from 'electron';
import { join } from 'node:path';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

import type { DatabaseConfig, IDatabase } from './database.types';
import { DATABASE_SETTINGS, TABLE_NAMES } from './database.constants';
import { configureDatabaseOptimizations } from './database.utils';
import { getDatabasePathManager, initializeDatabasePath } from './database.config';
import { logger } from '../logger';
import { logsService } from './services/logs.service';

const isWindows = process.platform === 'win32';

export class Database implements IDatabase {
  private static instance: Database;
  private db: SqlJsDatabase | null = null;
  private saveQueue: Promise<void> = Promise.resolve();

  private constructor() {}

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  /**
   * Инициализация базы данных
   */
  async initialize(config?: Partial<DatabaseConfig>): Promise<void> {
    return logger.withLogging(
      'Database',
      'Initialize database',
      async () => {
        if (config !== undefined) {
          initializeDatabasePath(config);
        }

        const pathManager = getDatabasePathManager();
        const dbPath = pathManager.getPath();

        logger.info('Database', 'Initializing database', {
          path: dbPath,
          config: pathManager.getConfig(),
        });

        const wasmPath = this.getWasmPath();
        const SQL = await initSqlJs({
          locateFile: (file) =>
            file.includes('sql-wasm.wasm') ? wasmPath : join(process.resourcesPath, file),
        });

        let buffer: Uint8Array | undefined;
        if (existsSync(dbPath)) {
          logger.info('Database', 'Loading existing database');
          buffer = readFileSync(dbPath);
        } else {
          logger.info('Database', 'Creating new database');
        }

        this.db = new SQL.Database(buffer);

        configureDatabaseOptimizations(this.db);
        this.createTables();
        this.setupAutoSave();
        this.setupLogCleanup();

        // Регистрируем writer для логгера
        logger.setDatabaseWriter(async (logs) => {
          await logsService.insertBatch(logs);
        });

        logger.info('Database', 'Database initialized successfully');
      },
      config,
    );
  }

  /**
   * Получить путь к WASM файлу
   */
  private getWasmPath(): string {
    const possiblePaths = app.isPackaged
      ? [
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
        ]
      : [
          join(__dirname, '../../../node_modules/sql.js/dist/sql-wasm.wasm'),
          join(process.cwd(), 'node_modules/sql.js/dist/sql-wasm.wasm'),
        ];

    for (const wasmPath of possiblePaths) {
      if (existsSync(wasmPath)) {
        logger.debug('Database', 'WASM file found', { path: wasmPath });
        return wasmPath;
      }
    }

    throw new Error('WASM file not found in any expected location');
  }

  /**
   * Создание таблиц и индексов
   */
  private createTables(): void {
    if (this.db === null) throw new Error('Database not initialized');

    logger.debug('Database', 'Creating tables and indexes');

    // Таблица sensor_data
    this.db.run(`
      CREATE TABLE IF NOT EXISTS ${TABLE_NAMES.SENSOR_DATA} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        record_id TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        time TEXT NOT NULL,
        port TEXT NOT NULL,
        raw_data TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )
    `);

    // Таблица channel_data
    this.db.run(`
      CREATE TABLE IF NOT EXISTS ${TABLE_NAMES.CHANNEL_DATA} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sensor_data_id INTEGER NOT NULL,
        channel INTEGER NOT NULL,
        value REAL NOT NULL,
        std_dev REAL,
        timestamp INTEGER NOT NULL,
        FOREIGN KEY (sensor_data_id) REFERENCES ${TABLE_NAMES.SENSOR_DATA}(id)
      )
    `);

    // Таблица sessions
    this.db.run(`
      CREATE TABLE IF NOT EXISTS ${TABLE_NAMES.SESSIONS} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        port TEXT NOT NULL,
        start_time INTEGER NOT NULL,
        end_time INTEGER,
        record_count INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'active'
      )
    `);

    // Индексы
    const indexes = [
      `CREATE INDEX IF NOT EXISTS idx_sensor_data_timestamp ON ${TABLE_NAMES.SENSOR_DATA}(timestamp)`,
      `CREATE INDEX IF NOT EXISTS idx_sensor_data_port ON ${TABLE_NAMES.SENSOR_DATA}(port)`,
      `CREATE INDEX IF NOT EXISTS idx_sensor_data_record_id ON ${TABLE_NAMES.SENSOR_DATA}(record_id)`,
      `CREATE INDEX IF NOT EXISTS idx_channel_data_sensor_id ON ${TABLE_NAMES.CHANNEL_DATA}(sensor_data_id)`,
      `CREATE INDEX IF NOT EXISTS idx_channel_data_channel ON ${TABLE_NAMES.CHANNEL_DATA}(channel)`,
      `CREATE INDEX IF NOT EXISTS idx_channel_data_timestamp ON ${TABLE_NAMES.CHANNEL_DATA}(timestamp)`,
    ];

    indexes.forEach((sql) => this.db!.run(sql));

    // Инициализация таблицы логов
    logsService.initializeTable();

    logger.info('Database', 'Tables and indexes created');
  }

  /**
   * Настройка автосохранения
   */
  private setupAutoSave(): void {
    const saveInterval = isWindows
      ? DATABASE_SETTINGS.AUTO_SAVE_INTERVAL_WINDOWS
      : DATABASE_SETTINGS.AUTO_SAVE_INTERVAL_OTHER;

    setInterval(() => {
      this.saveDatabaseAsync();
    }, saveInterval);

    app.on('before-quit', (event) => {
      event.preventDefault();
      logger.info('Database', 'Saving before quit');
      this.saveDatabase();
      setTimeout(() => app.exit(0), 1000);
    });
  }

  /**
   * Настройка автоматической очистки логов
   */
  private setupLogCleanup(): void {
    // Очистка каждые 6 часов
    setInterval(
      () => {
        void logger.withLogging('Database', 'Cleanup old logs', async () => {
          await logsService.cleanupOldLogs();
        });
      },
      6 * 60 * 60 * 1000,
    );

    // Первая очистка через 1 минуту после запуска
    setTimeout(() => {
      void logger.withLogging('Database', 'Initial log cleanup', async () => {
        await logsService.cleanupOldLogs();
      });
    }, 60 * 1000);
  }

  /**
   * Асинхронное сохранение базы данных
   */
  private saveDatabaseAsync(): void {
    this.saveQueue = this.saveQueue.then(() => this.saveDatabase());
  }

  /**
   * Получить экземпляр базы данных
   */
  getDatabase(): SqlJsDatabase {
    if (this.db === null) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  /**
   * Сохранить базу данных
   */
  saveDatabase(): void {
    return logger.withLoggingSync('Database', 'Save database', () => {
      if (this.db === null) {
        logger.warn('Database', 'Cannot save: not initialized');
        return;
      }

      const pathManager = getDatabasePathManager();
      const dbPath = pathManager.getPath();

      const startTime = Date.now();
      const data = this.db.export();
      writeFileSync(dbPath, Buffer.from(data), { flag: 'w' });

      const duration = Date.now() - startTime;

      logger.info('Database', 'Database saved successfully', {
        duration,
        size: data.length,
      });
    });
  }

  /**
   * Экспортировать базу данных
   */
  exportDatabase(exportPath: string): boolean {
    return logger.withLoggingSync(
      'Database',
      'Export database',
      () => {
        if (this.db === null) return false;

        const data = this.db.export();
        writeFileSync(exportPath, Buffer.from(data));

        logger.info('Database', 'Database exported successfully', {
          path: exportPath,
          size: data.length,
        });

        return true;
      },
      { exportPath },
    );
  }

  /**
   * Импортировать базу данных
   */
  async importDatabase(importPath: string): Promise<boolean> {
    return logger.withLogging(
      'Database',
      'Import database',
      async () => {
        if (!existsSync(importPath)) {
          throw new Error(`Import file does not exist: ${importPath}`);
        }

        const buffer = readFileSync(importPath);
        const wasmPath = this.getWasmPath();
        const SQL = await initSqlJs({ locateFile: () => wasmPath });

        this.db = new SQL.Database(buffer);
        configureDatabaseOptimizations(this.db);

        logger.info('Database', 'Database imported successfully', {
          path: importPath,
          size: buffer.length,
        });

        return true;
      },
      { importPath },
    );
  }

  /**
   * Выполнить VACUUM для оптимизации БД
   */
  vacuum(): void {
    return logger.withLoggingSync('Database', 'Vacuum database', () => {
      if (this.db === null) {
        throw new Error('Database not initialized');
      }

      this.db.run('VACUUM');
      this.saveDatabase();

      logger.info('Database', 'Vacuum completed successfully');
    });
  }

  /**
   * Очистить все данные из БД
   */
  clear(): void {
    return logger.withLoggingSync('Database', 'Clear database', () => {
      if (this.db === null) {
        throw new Error('Database not initialized');
      }

      this.db.run(`DELETE FROM ${TABLE_NAMES.CHANNEL_DATA}`);
      this.db.run(`DELETE FROM ${TABLE_NAMES.SENSOR_DATA}`);
      this.db.run(`DELETE FROM ${TABLE_NAMES.SESSIONS}`);
      this.db.run(
        `DELETE FROM sqlite_sequence WHERE name IN ('${TABLE_NAMES.CHANNEL_DATA}', '${TABLE_NAMES.SENSOR_DATA}', '${TABLE_NAMES.SESSIONS}')`,
      );
      this.db.run('VACUUM');

      this.saveDatabase();

      logger.info('Database', 'Database cleared successfully');
    });
  }

  /**
   * Корректное завершение работы с БД
   */
  async shutdown(): Promise<void> {
    return logger.withLogging('Database', 'Shutdown database', async () => {
      await this.saveQueue;
      this.saveDatabase();

      logger.info('Database', 'Database shutdown complete');
    });
  }
}

export const database = Database.getInstance();

// Экспортируем для обратной совместимости
export const getDatabase = (): SqlJsDatabase => database.getDatabase();
export const saveDatabase = (): void => database.saveDatabase();
export const exportDatabase = (exportPath: string): boolean => database.exportDatabase(exportPath);
export const importDatabase = (importPath: string): Promise<boolean> =>
  database.importDatabase(importPath);
export const initDatabase = (config?: Partial<DatabaseConfig>): Promise<void> =>
  database.initialize(config);
