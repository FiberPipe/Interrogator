// src/electron/database/service/sensor-data.service.ts

import { AppError } from '../../../../shared/errors/error.types';
import { ErrorCodes } from '../../../../shared/errors/error-codes';
import { logger } from '../../logger/logger';
import { getDatabase } from '../database';
import type {
  ChannelRecord,
  ChannelStats,
  ChannelStatsWithId,
  SensorDataRecord,
  SessionRecord,
} from '../database.types';
import type { LogMetadata } from '../../../../shared/types/logs.types';

export class SensorDataService {
  /**
   * Сохранение данных с датчиков
   */
  async saveSensorData(
    port: string,
    recordId: string,
    time: string,
    rawData: unknown,
    channels: ChannelRecord[],
  ): Promise<number> {
    return logger.withLogging(
      'Database',
      'Save sensor data',
      async () => {
        const db = getDatabase();
        const timestamp = Date.now();

        const metadata: LogMetadata = {
          port,
          recordId,
          channelCount: channels.length,
        };

        try {
          // Вставляем основную запись
          db.run(
            `INSERT INTO sensor_data (record_id, timestamp, time, port, raw_data, created_at) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [recordId, timestamp, time, port, JSON.stringify(rawData), timestamp],
          );

          // Получаем ID вставленной записи
          const result = db.exec('SELECT last_insert_rowid() as id');
          const sensorDataId = result[0].values[0][0] as number;

          // Вставляем данные по каналам
          if (channels.length > 0) {
            const stmt = db.prepare(
              `INSERT INTO channel_data (sensor_data_id, channel, value, std_dev, timestamp) 
               VALUES (?, ?, ?, ?, ?)`,
            );

            channels.forEach((ch) => {
              stmt.run([sensorDataId, ch.channel, ch.value, ch.stdDev ?? null, timestamp]);
            });

            stmt.free();
          }

          logger.debug('Database', 'Sensor data saved successfully', {
            ...metadata,
            sensorDataId,
          });

          return sensorDataId;
        } catch (err) {
          throw new AppError({
            code: ErrorCodes.DB_WRITE_FAILED,
            title: 'Database Write Failed',
            description: 'Failed to save sensor data to database',
            meta: metadata,
            cause: err,
            area: 'Database',
          });
        }
      },
      { port, recordId },
    );
  }

  /**
   * Получение данных за период
   */
  async getDataByTimeRange(
    port: string,
    startTime: number,
    endTime: number,
    limit = 1000,
  ): Promise<SensorDataRecord[]> {
    return logger.withLogging(
      'Database',
      'Get data by time range',
      async () => {
        const db = getDatabase();

        try {
          const result = db.exec(
            `SELECT * FROM sensor_data 
             WHERE port = ? AND timestamp >= ? AND timestamp <= ?
             ORDER BY timestamp DESC
             LIMIT ?`,
            [port, startTime, endTime, limit],
          );

          if (result.length === 0) {
            logger.debug('Database', 'No data found in time range', {
              port,
              startTime,
              endTime,
            });
            return [];
          }

          const columns = result[0].columns;
          const values = result[0].values;

          const records = values.map((row) => {
            const obj: Record<string, unknown> = {};
            columns.forEach((col, idx) => {
              obj[col] = row[idx];
            });
            return obj as unknown as SensorDataRecord;
          });

          logger.debug('Database', 'Data retrieved successfully', {
            port,
            recordCount: records.length,
            startTime,
            endTime,
          });

          return records;
        } catch (err) {
          throw new AppError({
            code: ErrorCodes.DB_READ_FAILED,
            title: 'Database Read Failed',
            description: 'Failed to retrieve sensor data from database',
            meta: { port, startTime, endTime, limit },
            cause: err,
            area: 'Database',
          });
        }
      },
      { port, startTime, endTime, limit },
    );
  }

  /**
   * Создание сессии
   */
  async createSession(port: string): Promise<number> {
    return logger.withLogging(
      'Session',
      'Create session',
      async () => {
        const db = getDatabase();

        try {
          db.run(
            `INSERT INTO sessions (port, start_time, record_count, status) 
             VALUES (?, ?, 0, 'active')`,
            [port, Date.now()],
          );

          const result = db.exec('SELECT last_insert_rowid() as id');
          const sessionId = result[0].values[0][0] as number;

          logger.info('Session', 'Session created successfully', {
            sessionId,
            port,
          });

          return sessionId;
        } catch (err) {
          throw new AppError({
            code: ErrorCodes.DB_WRITE_FAILED,
            title: 'Session Creation Failed',
            description: 'Failed to create new session',
            meta: { port },
            cause: err,
            area: 'Session',
          });
        }
      },
      { port },
    );
  }

  /**
   * Завершение сессии
   */
  async endSession(sessionId: number): Promise<void> {
    return logger.withLogging(
      'Session',
      'End session',
      async () => {
        const db = getDatabase();

        try {
          db.run(
            `UPDATE sessions 
             SET end_time = ?, status = 'stopped'
             WHERE id = ?`,
            [Date.now(), sessionId],
          );

          logger.info('Session', 'Session ended successfully', {
            sessionId,
          });
        } catch (err) {
          throw new AppError({
            code: ErrorCodes.DB_WRITE_FAILED,
            title: 'Session End Failed',
            description: 'Failed to end session',
            meta: { sessionId },
            cause: err,
            area: 'Session',
          });
        }
      },
      { sessionId },
    );
  }

  /**
   * Получение статистики базы данных
   */
  async getDatabaseStats(): Promise<{
    totalSensorRecords: number;
    totalChannelRecords: number;
    totalSessions: number;
    activeSessions: number;
    oldestRecord: number | null;
    newestRecord: number | null;
  }> {
    return logger.withLogging('Database', 'Get database stats', async () => {
      const db = getDatabase();

      try {
        // Количество записей датчиков
        const sensorResult = db.exec('SELECT COUNT(*) as count FROM sensor_data');
        const totalSensorRecords = (sensorResult[0]?.values[0]?.[0] as number) || 0;

        // Количество записей каналов
        const channelResult = db.exec('SELECT COUNT(*) as count FROM channel_data');
        const totalChannelRecords = (channelResult[0]?.values[0]?.[0] as number) || 0;

        // Количество сессий
        const sessionsResult = db.exec('SELECT COUNT(*) as count FROM sessions');
        const totalSessions = (sessionsResult[0]?.values[0]?.[0] as number) || 0;

        // Активные сессии
        const activeResult = db.exec(
          `SELECT COUNT(*) as count FROM sessions WHERE status = 'active'`,
        );
        const activeSessions = (activeResult[0]?.values[0]?.[0] as number) || 0;

        // Самая старая и новая запись
        const oldestResult = db.exec('SELECT MIN(timestamp) as oldest FROM sensor_data');
        const oldestRecord = (oldestResult[0]?.values[0]?.[0] as number) || null;

        const newestResult = db.exec('SELECT MAX(timestamp) as newest FROM sensor_data');
        const newestRecord = (newestResult[0]?.values[0]?.[0] as number) || null;

        return {
          totalSensorRecords,
          totalChannelRecords,
          totalSessions,
          activeSessions,
          oldestRecord,
          newestRecord,
        };
      } catch (err) {
        throw new AppError({
          code: ErrorCodes.DB_QUERY_FAILED,
          title: 'Stats Query Failed',
          description: 'Failed to retrieve database statistics',
          cause: err,
          area: 'Database',
        });
      }
    });
  }

  async incrementSessionRecords(sessionId: number): Promise<void> {
    return logger.withLogging(
      'Session',
      'Increment session records',
      async () => {
        const db = getDatabase();

        try {
          db.run(
            `UPDATE sessions 
             SET record_count = record_count + 1
             WHERE id = ?`,
            [sessionId],
          );

          logger.debug('Session', 'Record count incremented', { sessionId });
        } catch (err) {
          throw new AppError({
            code: ErrorCodes.DB_WRITE_FAILED,
            title: 'Session Update Failed',
            description: 'Failed to increment session record count',
            meta: { sessionId },
            cause: err,
            area: 'Session',
          });
        }
      },
      { sessionId },
    );
  }

  /**
   * Получить все сессии
   */
  async getAllSessions(): Promise<SessionRecord[]> {
    return logger.withLogging('Session', 'Get all sessions', async () => {
      const db = getDatabase();

      try {
        const result = db.exec(`SELECT * FROM sessions ORDER BY start_time DESC LIMIT 100`);

        if (result.length === 0) {
          return [];
        }

        const columns = result[0].columns;
        const values = result[0].values;

        return values.map((row) => {
          const obj: Record<string, unknown> = {};
          columns.forEach((col, idx) => {
            obj[col] = row[idx];
          });
          return obj as unknown as SessionRecord;
        });
      } catch (err) {
        throw new AppError({
          code: ErrorCodes.DB_READ_FAILED,
          title: 'Sessions Read Failed',
          description: 'Failed to retrieve sessions from database',
          cause: err,
          area: 'Session',
        });
      }
    });
  }

  /**
   * Получить последние N записей
   */
  async getLastRecords(port: string, limit = 100): Promise<SensorDataRecord[]> {
    return logger.withLogging(
      'Database',
      'Get last records',
      async () => {
        const db = getDatabase();

        try {
          const result = db.exec(
            `SELECT * FROM sensor_data 
             WHERE port = ?
             ORDER BY timestamp DESC
             LIMIT ?`,
            [port, limit],
          );

          if (result.length === 0) {
            return [];
          }

          const columns = result[0].columns;
          const values = result[0].values;

          return values.map((row) => {
            const obj: Record<string, unknown> = {};
            columns.forEach((col, idx) => {
              obj[col] = row[idx];
            });
            return obj as unknown as SensorDataRecord;
          });
        } catch (err) {
          throw new AppError({
            code: ErrorCodes.DB_READ_FAILED,
            title: 'Last Records Read Failed',
            description: 'Failed to retrieve last records from database',
            meta: { port, limit },
            cause: err,
            area: 'Database',
          });
        }
      },
      { port, limit },
    );
  }

  /**
   * Получить статистику канала
   */
  async getChannelStats(
    port: string,
    channel: number,
    startTime: number,
    endTime: number,
  ): Promise<ChannelStats> {
    return logger.withLogging(
      'Database',
      'Get channel stats',
      async () => {
        const db = getDatabase();

        try {
          const result = db.exec(
            `SELECT 
               COUNT(*) as count,
               MIN(value) as min,
               MAX(value) as max,
               AVG(value) as avg
             FROM channel_data cd
             INNER JOIN sensor_data sd ON cd.sensor_data_id = sd.id
             WHERE sd.port = ? 
               AND cd.channel = ?
               AND sd.timestamp >= ?
               AND sd.timestamp <= ?`,
            [port, channel, startTime, endTime],
          );

          if (result.length === 0 || result[0].values.length === 0) {
            return { count: 0, min: 0, max: 0, avg: 0 };
          }

          const row = result[0].values[0];
          return {
            count: (row[0] as number) ?? 0,
            min: (row[1] as number) ?? 0,
            max: (row[2] as number) ?? 0,
            avg: (row[3] as number) ?? 0,
          };
        } catch (err) {
          throw new AppError({
            code: ErrorCodes.DB_QUERY_FAILED,
            title: 'Channel Stats Failed',
            description: 'Failed to retrieve channel statistics',
            meta: { port, channel, startTime, endTime },
            cause: err,
            area: 'Database',
          });
        }
      },
      { port, channel, startTime, endTime },
    );
  }

  /**
   * Получить статистику по всем каналам за период одним запросом
   */
  async getAllChannelStats(
    port: string,
    startTime: number,
    endTime: number,
  ): Promise<ChannelStatsWithId[]> {
    return logger.withLogging(
      'Database',
      'Get all channel stats',
      async () => {
        const db = getDatabase();

        try {
          const result = db.exec(
            `SELECT
               cd.channel as channel,
               COUNT(*) as count,
               MIN(cd.value) as min,
               MAX(cd.value) as max,
               AVG(cd.value) as avg
             FROM channel_data cd
             INNER JOIN sensor_data sd ON cd.sensor_data_id = sd.id
             WHERE sd.port = ?
               AND sd.timestamp >= ?
               AND sd.timestamp <= ?
             GROUP BY cd.channel
             ORDER BY cd.channel`,
            [port, startTime, endTime],
          );

          if (result.length === 0 || result[0].values.length === 0) {
            return [];
          }

          return result[0].values.map((row) => ({
            channel: (row[0] as number) ?? 0,
            count: (row[1] as number) ?? 0,
            min: (row[2] as number) ?? 0,
            max: (row[3] as number) ?? 0,
            avg: (row[4] as number) ?? 0,
          }));
        } catch (err) {
          throw new AppError({
            code: ErrorCodes.DB_QUERY_FAILED,
            title: 'All Channel Stats Failed',
            description: 'Failed to retrieve statistics for all channels',
            meta: { port, startTime, endTime },
            cause: err,
            area: 'Database',
          });
        }
      },
      { port, startTime, endTime },
    );
  }
}

export const sensorDataService = new SensorDataService();
