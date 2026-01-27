// src/electron/database/service/logs.service.ts

import { logger as fileLogger } from '../../logger/utils';
import type { LogEntry } from '../../logger/utils';
import { getDatabase } from '../db';

const LOG_RETENTION_DAYS = 3; // храним логи 3 дня

export class LogsService {
  /**
   * Инициализация таблицы логов
   */
  initializeTable() {
    const db = getDatabase();

    try {
      db.run(`
        CREATE TABLE IF NOT EXISTS logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          timestamp INTEGER NOT NULL,
          level TEXT NOT NULL,
          message TEXT NOT NULL,
          context TEXT,
          stack TEXT,
          created_at INTEGER NOT NULL
        )
      `);

      db.run('CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp)');
      db.run('CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level)');
      db.run('CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at)');

      fileLogger.info('[LogsService] Table initialized');
    } catch (err) {
      fileLogger.error('[LogsService] Failed to initialize table:', err);
      throw err;
    }
  }

  /**
   * Пакетная вставка логов
   */
  async insertBatch(logs: LogEntry[]): Promise<void> {
    if (logs.length === 0) return;

    const db = getDatabase();
    const createdAt = Date.now();

    try {
      const stmt = db.prepare(`
        INSERT INTO logs (timestamp, level, message, context, stack, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      logs.forEach((log) => {
        stmt.run([
          log.timestamp,
          log.level,
          log.message,
          log.context || null,
          log.stack || null,
          createdAt,
        ]);
      });

      stmt.free();
    } catch (err) {
      fileLogger.error('[LogsService] Failed to insert batch:', err);
      throw err;
    }
  }

  /**
   * Получение логов с фильтрацией
   */
  async getLogs(options: {
    level?: string;
    startTime?: number;
    endTime?: number;
    limit?: number;
    search?: string;
  }): Promise<LogEntry[]> {
    const db = getDatabase();
    const { level, startTime, endTime, limit = 1000, search } = options;

    try {
      let sql = 'SELECT * FROM logs WHERE 1=1';
      const params: any[] = [];

      if (level) {
        sql += ' AND level = ?';
        params.push(level);
      }

      if (startTime) {
        sql += ' AND timestamp >= ?';
        params.push(startTime);
      }

      if (endTime) {
        sql += ' AND timestamp <= ?';
        params.push(endTime);
      }

      if (search) {
        sql += ' AND message LIKE ?';
        params.push(`%${search}%`);
      }

      sql += ' ORDER BY timestamp DESC LIMIT ?';
      params.push(limit);

      const result = db.exec(sql, params);

      if (result.length === 0) return [];

      const columns = result[0].columns;
      const values = result[0].values;

      return values.map((row) => {
        const obj: any = {};
        columns.forEach((col, idx) => {
          obj[col] = row[idx];
        });
        return obj as LogEntry;
      });
    } catch (err) {
      fileLogger.error('[LogsService] Failed to get logs:', err);
      throw err;
    }
  }

  /**
   * Получение статистики логов
   */
  async getStats(): Promise<{
    total: number;
    byLevel: Record<string, number>;
    oldestLog: number | null;
    newestLog: number | null;
  }> {
    const db = getDatabase();

    try {
      // Общее количество
      const totalResult = db.exec('SELECT COUNT(*) as count FROM logs');
      const total = (totalResult[0]?.values[0]?.[0] as number) || 0;

      // По уровням
      const levelResult = db.exec('SELECT level, COUNT(*) as count FROM logs GROUP BY level');
      const byLevel: Record<string, number> = {};

      if (levelResult.length > 0) {
        levelResult[0].values.forEach((row) => {
          byLevel[row[0] as string] = row[1] as number;
        });
      }

      // Временные рамки
      const oldestResult = db.exec('SELECT MIN(timestamp) as oldest FROM logs');
      const oldestLog = (oldestResult[0]?.values[0]?.[0] as number) || null;

      const newestResult = db.exec('SELECT MAX(timestamp) as newest FROM logs');
      const newestLog = (newestResult[0]?.values[0]?.[0] as number) || null;

      return { total, byLevel, oldestLog, newestLog };
    } catch (err) {
      fileLogger.error('[LogsService] Failed to get stats:', err);
      throw err;
    }
  }

  /**
   * Очистка старых логов (старше LOG_RETENTION_DAYS дней)
   */
  async cleanupOldLogs(): Promise<number> {
    const db = getDatabase();
    const cutoffTime = Date.now() - LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000;

    try {
      db.run('DELETE FROM logs WHERE timestamp < ?', [cutoffTime]);

      const result = db.exec('SELECT changes() as count');
      const deletedCount = (result[0]?.values[0]?.[0] as number) || 0;

      if (deletedCount > 0) {
        fileLogger.info(`[LogsService] Cleaned up ${deletedCount} old logs`);
      }

      return deletedCount;
    } catch (err) {
      fileLogger.error('[LogsService] Failed to cleanup old logs:', err);
      throw err;
    }
  }

  /**
   * Удаление всех логов
   */
  async clearAllLogs(): Promise<void> {
    const db = getDatabase();

    try {
      db.run('DELETE FROM logs');
      db.run('DELETE FROM sqlite_sequence WHERE name = "logs"');
      db.run('VACUUM');

      fileLogger.info('[LogsService] All logs cleared');
    } catch (err) {
      fileLogger.error('[LogsService] Failed to clear logs:', err);
      throw err;
    }
  }

  /**
   * Экспорт логов в JSON
   */
  async exportToJson(filePath: string, options?: { level?: string; startTime?: number; endTime?: number }): Promise<boolean> {
    try {
      const logs = await this.getLogs({
        level: options?.level,
        startTime: options?.startTime,
        endTime: options?.endTime,
        limit: 100000, // большой лимит для экспорта
      });

      const fs = await import('fs');
      fs.writeFileSync(filePath, JSON.stringify(logs, null, 2), 'utf-8');

      fileLogger.info(`[LogsService] Exported ${logs.length} logs to ${filePath}`);
      return true;
    } catch (err) {
      fileLogger.error('[LogsService] Failed to export logs:', err);
      return false;
    }
  }
}

export const logsService = new LogsService();
