// src/electron/features/database/services/logs.service.ts

import type {
  LogEntry,
  LogsStats,
  LogsFilter,
  LogMetadata,
} from '../../../../shared/types/logs.types';
import { TABLE_NAMES } from '../database.constants';
import { executeQuery, getSingleValue } from '../database.utils';
import { database } from '../database';
import { logger } from '../../logger';
import { createError } from '../../../../shared/errors';
import { ErrorCodes } from '../../../../shared/errors/error-codes';

const LOG_RETENTION_DAYS = 3;

export class LogsService {
  /**
   * Инициализация таблицы логов
   */
  initializeTable(): void {
    return logger.withLoggingSync('Database', 'Initialize logs table', () => {
      const db = database.getDatabase();

      try {
        db.run(`
          CREATE TABLE IF NOT EXISTS ${TABLE_NAMES.LOGS} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp INTEGER NOT NULL,
            level TEXT NOT NULL,
            area TEXT NOT NULL,
            message TEXT NOT NULL,
            metadata TEXT,
            stack TEXT,
            created_at INTEGER NOT NULL
          )
        `);

        db.run(`CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON ${TABLE_NAMES.LOGS}(timestamp)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_logs_level ON ${TABLE_NAMES.LOGS}(level)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_logs_area ON ${TABLE_NAMES.LOGS}(area)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_logs_created_at ON ${TABLE_NAMES.LOGS}(created_at)`);
        db.run(
          `CREATE INDEX IF NOT EXISTS idx_logs_error_code ON ${TABLE_NAMES.LOGS}(json_extract(metadata, '$.errorCode')) WHERE metadata IS NOT NULL`,
        );

        logger.info('Database', 'Logs table initialized');
      } catch (err) {
        throw createError({
          code: ErrorCodes.DB_INIT_FAILED,
          title: 'Logs Table Init Failed',
          description: 'Failed to initialize logs table',
          cause: err,
          area: 'Logger',
        });
      }
    });
  }

  /**
   * Пакетная вставка логов
   */
  async insertBatch(logs: LogEntry[]): Promise<void> {
    if (logs.length === 0) return;

    const db = database.getDatabase();
    const createdAt = Date.now();

    try {
      const stmt = db.prepare(`
        INSERT INTO ${TABLE_NAMES.LOGS} (timestamp, level, area, message, metadata, stack, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      logs.forEach((log) => {
        stmt.run([
          log.timestamp,
          log.level,
          log.area,
          log.message,
          log.metadata || null,
          log.stack || null,
          createdAt,
        ]);
      });

      stmt.free();
    } catch (err) {
      // Не выбрасываем ошибку, чтобы не прервать работу приложения
      console.error('[LogsService] Failed to insert batch:', err);
    }
  }

  /**
   * Получение логов с фильтрацией
   */
  async getLogs(options: LogsFilter): Promise<LogEntry[]> {
    const db = database.getDatabase();
    const { level, area, startTime, endTime, limit = 1000, search, errorCode } = options;

    try {
      let sql = `SELECT * FROM ${TABLE_NAMES.LOGS} WHERE 1=1`;
      const params: any[] = [];

      if (level !== undefined) {
        sql += ' AND level = ?';
        params.push(level);
      }

      if (area !== undefined) {
        sql += ' AND area = ?';
        params.push(area);
      }

      if (startTime !== undefined) {
        sql += ' AND timestamp >= ?';
        params.push(startTime);
      }

      if (endTime !== undefined) {
        sql += ' AND timestamp <= ?';
        params.push(endTime);
      }

      if (search !== undefined) {
        sql += ' AND message LIKE ?';
        params.push(`%${search}%`);
      }

      if (errorCode !== undefined) {
        sql += " AND json_extract(metadata, '$.errorCode') = ?";
        params.push(errorCode);
      }

      sql += ' ORDER BY timestamp DESC LIMIT ?';
      params.push(limit);

      return executeQuery<LogEntry>(db, sql, params);
    } catch (err) {
      logger.error('Database', 'Failed to get logs', options as LogMetadata, err);
      throw err;
    }
  }

  /**
   * Получение статистики логов
   */
  async getStats(): Promise<LogsStats> {
    const db = database.getDatabase();

    try {
      // Общее количество
      const totalResult = db.exec(`SELECT COUNT(*) as count FROM ${TABLE_NAMES.LOGS}`);
      const total = getSingleValue<number>(totalResult, 0);

      // По уровням
      const levelResult = db.exec(
        `SELECT level, COUNT(*) as count FROM ${TABLE_NAMES.LOGS} GROUP BY level`,
      );
      const byLevel: Record<string, number> = {};

      if (levelResult.length > 0) {
        levelResult[0].values.forEach((row) => {
          byLevel[row[0] as string] = row[1] as number;
        });
      }

      // По областям
      const areaResult = db.exec(
        `SELECT area, COUNT(*) as count FROM ${TABLE_NAMES.LOGS} GROUP BY area`,
      );
      const byArea: Record<string, number> = {};

      if (areaResult.length > 0) {
        areaResult[0].values.forEach((row) => {
          byArea[row[0] as string] = row[1] as number;
        });
      }

      // Временные рамки
      const oldestResult = db.exec(`SELECT MIN(timestamp) as oldest FROM ${TABLE_NAMES.LOGS}`);
      const oldestLog = getSingleValue<number | null>(oldestResult, null);

      const newestResult = db.exec(`SELECT MAX(timestamp) as newest FROM ${TABLE_NAMES.LOGS}`);
      const newestLog = getSingleValue<number | null>(newestResult, null);

      return { total, byLevel, byArea, oldestLog, newestLog };
    } catch (err) {
      logger.error('Database', 'Failed to get logs stats', {}, err);
      throw err;
    }
  }

  /**
   * Очистка старых логов
   */
  async cleanupOldLogs(): Promise<number> {
    const db = database.getDatabase();
    const cutoffTime = Date.now() - LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000;

    try {
      db.run(`DELETE FROM ${TABLE_NAMES.LOGS} WHERE timestamp < ?`, [cutoffTime]);

      const result = db.exec('SELECT changes() as count');
      const deletedCount = getSingleValue<number>(result, 0);

      if (deletedCount > 0) {
        logger.info('Database', 'Old logs cleaned up', {
          deletedCount,
          cutoffTime,
        });
      }

      return deletedCount;
    } catch (err) {
      logger.error('Database', 'Failed to cleanup old logs', {}, err);
      throw err;
    }
  }

  /**
   * Удаление всех логов
   */
  async clearAllLogs(): Promise<void> {
    const db = database.getDatabase();

    try {
      db.run(`DELETE FROM ${TABLE_NAMES.LOGS}`);
      db.run(`DELETE FROM sqlite_sequence WHERE name = '${TABLE_NAMES.LOGS}'`);
      db.run('VACUUM');

      logger.warn('Database', 'All logs cleared');
    } catch (err) {
      logger.error('Database', 'Failed to clear logs', {}, err);
      throw err;
    }
  }

  /**
   * Экспорт логов в JSON
   */
  async exportToJson(
    filePath: string,
    options?: { level?: string; area?: string; startTime?: number; endTime?: number },
  ): Promise<boolean> {
    try {
      const logs = await this.getLogs({
        level: options?.level as any,
        area: options?.area as any,
        startTime: options?.startTime,
        endTime: options?.endTime,
        limit: 100000,
      });

      const fs = await import('fs');
      fs.writeFileSync(filePath, JSON.stringify(logs, null, 2), 'utf-8');

      logger.info('Database', 'Logs exported', {
        path: filePath,
        count: logs.length,
      });

      return true;
    } catch (err) {
      logger.error('Database', 'Failed to export logs', { filePath }, err);
      return false;
    }
  }
}

export const logsService = new LogsService();
