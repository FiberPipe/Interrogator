import { getDatabase } from '../db';

export interface SensorDataRecord {
  id: number;
  record_id: string;
  timestamp: number;
  time: string;
  port: string;
  raw_data: string;
  created_at: number;
}

export interface ChannelRecord {
  channel: number;
  value: number;
  stdDev?: number;
}

export interface SessionRecord {
  id: number;
  port: string;
  start_time: number;
  end_time?: number;
  record_count: number;
  status: 'active' | 'stopped' | 'error';
}

export class SensorDataService {
  /**
   * Сохранение данных с датчиков
   */
  async saveSensorData(
    port: string,
    recordId: string,
    time: string,
    rawData: any,
    channels: ChannelRecord[]
  ): Promise<number> {
    const db = getDatabase();
    const timestamp = Date.now();

    try {
      // Вставляем основную запись
      db.run(
        `INSERT INTO sensor_data (record_id, timestamp, time, port, raw_data, created_at) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [recordId, timestamp, time, port, JSON.stringify(rawData), timestamp]
      );

      // Получаем ID вставленной записи
      const result = db.exec('SELECT last_insert_rowid() as id');
      const sensorDataId = result[0].values[0][0] as number;

      // Вставляем данные по каналам
      if (channels.length > 0) {
        const stmt = db.prepare(
          `INSERT INTO channel_data (sensor_data_id, channel, value, std_dev, timestamp) 
           VALUES (?, ?, ?, ?, ?)`
        );

        channels.forEach((ch) => {
          stmt.run([sensorDataId, ch.channel, ch.value, ch.stdDev ?? null, timestamp]);
        });

        stmt.free();
      }

      return sensorDataId;
    } catch (err) {
      console.error('[SensorDataService] Error saving data:', err);
      throw err;
    }
  }

  /**
   * Получение данных за период
   */
  async getDataByTimeRange(
    port: string,
    startTime: number,
    endTime: number,
    limit = 1000
  ): Promise<SensorDataRecord[]> {
    const db = getDatabase();

    try {
      const result = db.exec(
        `SELECT * FROM sensor_data 
         WHERE port = ? AND timestamp >= ? AND timestamp <= ?
         ORDER BY timestamp DESC
         LIMIT ?`,
        [port, startTime, endTime, limit]
      );

      if (result.length === 0) return [];

      const columns = result[0].columns;
      const values = result[0].values;

      return values.map((row) => {
        const obj: any = {};
        columns.forEach((col, idx) => {
          obj[col] = row[idx];
        });
        return obj as SensorDataRecord;
      });
    } catch (err) {
      console.error('[SensorDataService] Error getting data by time range:', err);
      throw err;
    }
  }

  /**
   * Получение последних N записей
   */
  async getLastRecords(port: string, limit = 100): Promise<SensorDataRecord[]> {
    const db = getDatabase();

    try {
      const result = db.exec(
        `SELECT * FROM sensor_data 
         WHERE port = ?
         ORDER BY timestamp DESC
         LIMIT ?`,
        [port, limit]
      );

      if (result.length === 0) return [];

      const columns = result[0].columns;
      const values = result[0].values;

      return values.map((row) => {
        const obj: any = {};
        columns.forEach((col, idx) => {
          obj[col] = row[idx];
        });
        return obj as SensorDataRecord;
      });
    } catch (err) {
      console.error('[SensorDataService] Error getting last records:', err);
      throw err;
    }
  }

  /**
   * Статистика по каналу
   */
  async getChannelStats(
    port: string,
    channel: number,
    startTime: number,
    endTime: number
  ): Promise<{ count: number; min: number; max: number; avg: number }> {
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
         WHERE sd.port = ? AND cd.channel = ? 
           AND cd.timestamp >= ? AND cd.timestamp <= ?`,
        [port, channel, startTime, endTime]
      );

      if (result.length === 0 || result[0].values.length === 0) {
        return { count: 0, min: 0, max: 0, avg: 0 };
      }

      const [count, min, max, avg] = result[0].values[0];

      return {
        count: (count as number) || 0,
        min: (min as number) || 0,
        max: (max as number) || 0,
        avg: (avg as number) || 0,
      };
    } catch (err) {
      console.error('[SensorDataService] Error getting channel stats:', err);
      throw err;
    }
  }

  /**
   * Получить общее количество записей
   */
  async getTotalRecordCount(port?: string): Promise<number> {
    const db = getDatabase();

    try {
      const sql = port
        ? 'SELECT COUNT(*) as count FROM sensor_data WHERE port = ?'
        : 'SELECT COUNT(*) as count FROM sensor_data';
      
      const params = port ? [port] : [];
      const result = db.exec(sql, params);

      if (result.length === 0 || result[0].values.length === 0) {
        return 0;
      }

      return (result[0].values[0][0] as number) || 0;
    } catch (err) {
      console.error('[SensorDataService] Error getting total record count:', err);
      return 0;
    }
  }

  /**
   * Создание сессии
   */
  async createSession(port: string): Promise<number> {
    const db = getDatabase();

    try {
      db.run(
        `INSERT INTO sessions (port, start_time, record_count, status) 
         VALUES (?, ?, 0, 'active')`,
        [port, Date.now()]
      );

      const result = db.exec('SELECT last_insert_rowid() as id');
      const sessionId = result[0].values[0][0] as number;

      console.log(`[SensorDataService] Created session ${sessionId} for port ${port}`);
      
      return sessionId;
    } catch (err) {
      console.error('[SensorDataService] Error creating session:', err);
      throw err;
    }
  }

  /**
   * Обновление счётчика записей в сессии
   */
  async incrementSessionRecords(sessionId: number): Promise<void> {
    const db = getDatabase();

    try {
      db.run(
        `UPDATE sessions 
         SET record_count = record_count + 1
         WHERE id = ?`,
        [sessionId]
      );
    } catch (err) {
      console.error('[SensorDataService] Error incrementing session records:', err);
      // Не выбрасываем ошибку, чтобы не прервать поток данных
    }
  }

  /**
   * Завершение сессии
   */
  async endSession(sessionId: number): Promise<void> {
    const db = getDatabase();

    try {
      db.run(
        `UPDATE sessions 
         SET end_time = ?, status = 'stopped'
         WHERE id = ?`,
        [Date.now(), sessionId]
      );

      console.log(`[SensorDataService] Ended session ${sessionId}`);
    } catch (err) {
      console.error('[SensorDataService] Error ending session:', err);
      throw err;
    }
  }

  /**
   * Получить активную сессию для порта
   */
  async getActiveSession(port: string): Promise<SessionRecord | null> {
    const db = getDatabase();

    try {
      const result = db.exec(
        `SELECT * FROM sessions 
         WHERE port = ? AND status = 'active'
         ORDER BY start_time DESC
         LIMIT 1`,
        [port]
      );

      if (result.length === 0 || result[0].values.length === 0) {
        return null;
      }

      const columns = result[0].columns;
      const row = result[0].values[0];
      const obj: any = {};
      
      columns.forEach((col, idx) => {
        obj[col] = row[idx];
      });

      return obj as SessionRecord;
    } catch (err) {
      console.error('[SensorDataService] Error getting active session:', err);
      return null;
    }
  }

  /**
   * Получить все сессии (последние N)
   */
  async getAllSessions(limit = 100): Promise<SessionRecord[]> {
    const db = getDatabase();

    try {
      const result = db.exec(
        `SELECT * FROM sessions 
         ORDER BY start_time DESC 
         LIMIT ?`,
        [limit]
      );

      if (result.length === 0) return [];

      const columns = result[0].columns;
      const values = result[0].values;

      return values.map((row) => {
        const obj: any = {};
        columns.forEach((col, idx) => {
          obj[col] = row[idx];
        });
        return obj as SessionRecord;
      });
    } catch (err) {
      console.error('[SensorDataService] Error getting all sessions:', err);
      return [];
    }
  }

  /**
   * Получить сессии для конкретного порта
   */
  async getSessionsByPort(port: string, limit = 50): Promise<SessionRecord[]> {
    const db = getDatabase();

    try {
      const result = db.exec(
        `SELECT * FROM sessions 
         WHERE port = ?
         ORDER BY start_time DESC 
         LIMIT ?`,
        [port, limit]
      );

      if (result.length === 0) return [];

      const columns = result[0].columns;
      const values = result[0].values;

      return values.map((row) => {
        const obj: any = {};
        columns.forEach((col, idx) => {
          obj[col] = row[idx];
        });
        return obj as SessionRecord;
      });
    } catch (err) {
      console.error('[SensorDataService] Error getting sessions by port:', err);
      return [];
    }
  }

  /**
   * Получить данные канала для построения графика
   */
  async getChannelData(
    port: string,
    channel: number,
    startTime: number,
    endTime: number,
    limit = 1000
  ): Promise<Array<{ timestamp: number; value: number; std_dev?: number }>> {
    const db = getDatabase();

    try {
      const result = db.exec(
        `SELECT cd.timestamp, cd.value, cd.std_dev
         FROM channel_data cd
         INNER JOIN sensor_data sd ON cd.sensor_data_id = sd.id
         WHERE sd.port = ? AND cd.channel = ? 
           AND cd.timestamp >= ? AND cd.timestamp <= ?
         ORDER BY cd.timestamp ASC
         LIMIT ?`,
        [port, channel, startTime, endTime, limit]
      );

      if (result.length === 0) return [];

      const values = result[0].values;

      return values.map((row) => ({
        timestamp: row[0] as number,
        value: row[1] as number,
        std_dev: row[2] as number | undefined,
      }));
    } catch (err) {
      console.error('[SensorDataService] Error getting channel data:', err);
      return [];
    }
  }

  /**
   * Удалить старые данные (очистка по времени)
   */
  async deleteOldData(olderThan: number): Promise<number> {
    const db = getDatabase();

    try {
      // Сначала удаляем связанные данные каналов
      db.run(
        `DELETE FROM channel_data 
         WHERE sensor_data_id IN (
           SELECT id FROM sensor_data WHERE timestamp < ?
         )`,
        [olderThan]
      );

      // Затем удаляем основные записи
      const result = db.exec(
        `DELETE FROM sensor_data WHERE timestamp < ?`,
        [olderThan]
      );

      // Получаем количество удалённых записей
      const changesResult = db.exec('SELECT changes() as count');
      const deletedCount = (changesResult[0]?.values[0]?.[0] as number) || 0;

      console.log(`[SensorDataService] Deleted ${deletedCount} old records`);
      
      return deletedCount;
    } catch (err) {
      console.error('[SensorDataService] Error deleting old data:', err);
      throw err;
    }
  }

  /**
   * Получить статистику базы данных
   */
  async getDatabaseStats(): Promise<{
    totalSensorRecords: number;
    totalChannelRecords: number;
    totalSessions: number;
    activeSessions: number;
    oldestRecord: number | null;
    newestRecord: number | null;
  }> {
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
      const activeResult = db.exec(`SELECT COUNT(*) as count FROM sessions WHERE status = 'active'`);
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
      console.error('[SensorDataService] Error getting database stats:', err);
      throw err;
    }
  }
}

// Singleton instance
export const sensorDataService = new SensorDataService();
