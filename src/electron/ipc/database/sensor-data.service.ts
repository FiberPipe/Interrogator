import { getDatabase } from "../../db/db";

export interface SensorDataRecord {
  recordId: string;
  timestamp: number;
  time: string;
  port: string;
  rawData: string;
}

export interface ChannelRecord {
  channel: number;
  value: number;
  stdDev?: number;
}

export class SensorDataService {
  // Сохранение данных с датчиков
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

  // Получение данных за период
  async getDataByTimeRange(
    port: string,
    startTime: number,
    endTime: number,
    limit = 1000
  ) {
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
        return obj;
      });
    } catch (err) {
      console.error('[SensorDataService] Error getting data:', err);
      throw err;
    }
  }

  // Получение последних N записей
  async getLastRecords(port: string, limit = 100) {
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
        return obj;
      });
    } catch (err) {
      console.error('[SensorDataService] Error getting last records:', err);
      throw err;
    }
  }

  // Статистика по каналу
  async getChannelStats(
    port: string,
    channel: number,
    startTime: number,
    endTime: number
  ) {
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
        count: count as number,
        min: min as number,
        max: max as number,
        avg: avg as number,
      };
    } catch (err) {
      console.error('[SensorDataService] Error getting channel stats:', err);
      throw err;
    }
  }

  // Создание сессии
  async createSession(port: string): Promise<number> {
    const db = getDatabase();

    try {
      db.run(
        `INSERT INTO sessions (port, start_time, record_count, status) 
         VALUES (?, ?, 0, 'active')`,
        [port, Date.now()]
      );

      const result = db.exec('SELECT last_insert_rowid() as id');
      return result[0].values[0][0] as number;
    } catch (err) {
      console.error('[SensorDataService] Error creating session:', err);
      throw err;
    }
  }

  // Обновление счётчика записей в сессии
  async incrementSessionRecords(sessionId: number) {
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
      throw err;
    }
  }

  // Завершение сессии
  async endSession(sessionId: number) {
    const db = getDatabase();

    try {
      db.run(
        `UPDATE sessions 
         SET end_time = ?, status = 'stopped'
         WHERE id = ?`,
        [Date.now(), sessionId]
      );
    } catch (err) {
      console.error('[SensorDataService] Error ending session:', err);
      throw err;
    }
  }

  // Получить статистику по всем сессиям
  async getAllSessions() {
    const db = getDatabase();

    try {
      const result = db.exec(
        `SELECT * FROM sessions ORDER BY start_time DESC LIMIT 100`
      );

      if (result.length === 0) return [];

      const columns = result[0].columns;
      const values = result[0].values;

      return values.map((row) => {
        const obj: any = {};
        columns.forEach((col, idx) => {
          obj[col] = row[idx];
        });
        return obj;
      });
    } catch (err) {
      console.error('[SensorDataService] Error getting sessions:', err);
      throw err;
    }
  }
}

export const sensorDataService = new SensorDataService();
