import type { BrowserWindow } from 'electron';
import { sensorDataService } from '../database/service/sensor-data.service';

interface ParsedSensorData {
  id: string;
  time: string;
  [key: string]: any;
}

export class SerialDataProcessor {
  private sessionId: number | null = null;
  private recordCount = 0;
  private lastSaveTime = Date.now();
  private saveInterval = 5000; // Обновляем счётчик раз в 5 секунд

  constructor(private port: string, private win: BrowserWindow) {}

  async startSession() {
    try {
      this.sessionId = await sensorDataService.createSession(this.port);
      console.log(`[DataProcessor ${this.port}] ✅ Session started: ${this.sessionId}`);
    } catch (err) {
      console.error(`[DataProcessor ${this.port}] ❌ Failed to start session:`, err);
    }
  }

  async processData(dataString: string) {
    try {
      const parsed: ParsedSensorData = JSON.parse(dataString);

      // 1. Сначала отправляем данные на клиент (приоритет)
      this.sendToClient(parsed);

      // 2. Затем сохраняем в БД (параллельно, не блокируя)
      this.saveToDatabase(parsed).catch((err) => {
        console.error(`[DataProcessor ${this.port}] DB save error:`, err);
      });

      this.recordCount++;
    } catch (err) {
      console.error(`[DataProcessor ${this.port}] Parse error:`, err);
    }
  }

  private sendToClient(data: ParsedSensorData) {
    this.win.webContents.send('serial:data', {
      port: this.port,
      data: JSON.stringify(data),
    });
  }

  private async saveToDatabase(data: ParsedSensorData) {
    try {
      // Извлекаем данные по каналам
      const channels = [];

      for (let i = 0; i < 16; i++) {
        const pKey = `P${i}`;
        const stdDevKey = `stdDev${i}`;

        if (pKey in data) {
          channels.push({
            channel: i,
            value: Number(data[pKey]),
            stdDev: stdDevKey in data ? Number(data[stdDevKey]) : undefined,
          });
        }
      }

      // Сохраняем в БД
      await sensorDataService.saveSensorData(this.port, data.id, data.time, data, channels);

      // Обновляем счётчик в сессии (не слишком часто)
      const now = Date.now();
      if (now - this.lastSaveTime > this.saveInterval && this.sessionId) {
        await sensorDataService.incrementSessionRecords(this.sessionId);
        this.lastSaveTime = now;
      }
    } catch (err) {
      console.error(`[DataProcessor ${this.port}] DB save error:`, err);
      throw err;
    }
  }

  async endSession() {
    if (this.sessionId) {
      try {
        await sensorDataService.endSession(this.sessionId);
        console.log(
          `[DataProcessor ${this.port}] ✅ Session ended: ${this.sessionId}, Records: ${this.recordCount}`
        );
      } catch (err) {
        console.error(`[DataProcessor ${this.port}] ❌ Failed to end session:`, err);
      }
    }
  }

  getRecordCount(): number {
    return this.recordCount;
  }
}
