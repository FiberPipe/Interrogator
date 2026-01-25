import type { BrowserWindow } from 'electron';

import { sensorDataService } from '../database/service/sensor-data.service';
import { appStorage } from '../storage/app-storage';
import { logger } from '../logger/utils';

interface RawSensorData {
  id: string;
  time: string;
  [key: string]: any;
}

interface ProcessedData extends RawSensorData {
  normalized: Record<string, number>;
  wavelengths: Record<string, number>;
}

interface CalibrationData {
  normalization: Record<string, number>; // field0-15
  wavelengths: Record<string, number>; // lambdas_central0-15
}

interface SensorMapping {
  index: number;
  type: string;
  channels: string[]; // ['P0', 'P1', 'P2', 'P3']
  alias?: string;
}

export class SerialDataProcessor {
  private sessionId: number | null = null;
  private recordCount = 0;
  private lastSaveTime = Date.now();
  private saveInterval = 5000;

  constructor(
    private port: string,
    private win: BrowserWindow,
  ) {}

  async startSession() {
    try {
      this.sessionId = await sensorDataService.createSession(this.port);
      logger.info(`[DataProcessor ${this.port}] ✅ Session started: ${this.sessionId}`);
    } catch (err) {
      logger.error(`[DataProcessor ${this.port}] ❌ Failed to start session:`, err);
    }
  }

  async processData(dataString: string) {
    try {
      const rawData: RawSensorData = JSON.parse(dataString);

      // 1. Получаем калибровочные данные
      const calibrationData = await this.getCalibrationData();
      const sensorMappings = await this.getSensorMappings();

      // 2. Нормализуем данные
      const normalized = this.normalizeData(rawData, calibrationData);

      // 3. Вычисляем wavelength для каждого датчика
      const wavelengths = this.calculateWavelengths(normalized, calibrationData, sensorMappings);

      // 4. Формируем итоговый пакет
      const processedData: ProcessedData = {
        ...rawData,
        normalized,
        wavelengths,
      };

      // 5. Отправляем на клиент
      this.sendToClient(processedData);

      // 6. Сохраняем в БД
      await this.saveToDatabase(processedData);

      this.recordCount++;
    } catch (err) {
      logger.error(`[DataProcessor ${this.port}] Parse error:`, err);
    }
  }

  private async getCalibrationData(): Promise<CalibrationData> {
    const data = appStorage.get<any>('calibrationData');
    return (
      data || {
        normalization: {},
        wavelengths: {},
      }
    );
  }

  private async getSensorMappings(): Promise<SensorMapping[]> {
    const sensorConfig = appStorage.get<Record<number, any>>('sensorConfig') || {};
    const sensorCount = appStorage.get<number>('sensorCount') || 0;

    const mappings: SensorMapping[] = [];

    for (let i = 0; i < sensorCount; i++) {
      const config = sensorConfig[i];
      if (config) {
        mappings.push({
          index: i,
          type: config.type || '',
          channels: config.channels || [],
          alias: config.alias || `Sensor ${i}`,
        });
      }
    }

    return mappings;
  }

  private normalizeData(
    rawData: RawSensorData,
    calibration: CalibrationData,
  ): Record<string, number> {
    const normalized: Record<string, number> = {};

    for (let i = 0; i < 16; i++) {
      const key = `P${i}`;
      const rawValue = parseFloat(rawData[key]) || 0;
      const normValue = parseFloat(String(calibration.normalization[`field${i}`] || 0));

      normalized[key] = Math.max(0, rawValue - normValue);
    }

    return normalized;
  }

  private calculateWavelengths(
    normalized: Record<string, number>,
    calibration: CalibrationData,
    sensors: SensorMapping[],
  ): Record<string, number> {
    const wavelengths: Record<string, number> = {};

    for (const sensor of sensors) {
      const { index, channels } = sensor;

      // Минимум 2 канала для расчета
      if (channels.length < 2) {
        wavelengths[`wavelength${index}`] = NaN;
        continue;
      }

      // Получаем веса и центральные длины волн
      const weights = channels.map((ch) => normalized[ch] || 0);
      const lambdas = channels.map((ch) => {
        const chIndex = parseInt(ch.replace('P', ''));
        return parseFloat(String(calibration.wavelengths[`lambdas_central${chIndex}`] || 0));
      });

      // Weighted average
      const sumWeights = weights.reduce((sum, w) => sum + w, 0);

      if (sumWeights > 0) {
        const weightedSum = weights.reduce((sum, w, i) => sum + w * lambdas[i], 0);
        wavelengths[`wavelength${index}`] = weightedSum / sumWeights;
      } else {
        wavelengths[`wavelength${index}`] = NaN;
      }
    }

    return wavelengths;
  }

  private sendToClient(data: ProcessedData) {
    this.win.webContents.send('serial:data', {
      port: this.port,
      data: JSON.stringify(data),
    });
  }

  private async saveToDatabase(data: ProcessedData) {
    try {
      // Извлекаем данные по каналам (raw + normalized)
      const channels = [];

      for (let i = 0; i < 16; i++) {
        const pKey = `P${i}`;
        const stdDevKey = `stdDev${i}`;

        channels.push({
          channel: i,
          value: parseFloat(data[pKey]) || 0,
          normalized: data.normalized[pKey] || 0,
          stdDev: parseFloat(data[stdDevKey]) || 0,
        });
      }

      // Добавляем wavelengths к основным данным
      const fullData = {
        ...data,
        ...data.wavelengths,
      };

      await sensorDataService.saveSensorData(this.port, data.id, data.time, fullData, channels);

      // Обновляем счетчик в сессии
      const now = Date.now();
      if (now - this.lastSaveTime > this.saveInterval && this.sessionId) {
        await sensorDataService.incrementSessionRecords(this.sessionId);
        this.lastSaveTime = now;
      }
    } catch (err) {
      logger.error(`[DataProcessor ${this.port}] DB save error:`, err);
      throw err;
    }
  }

  async endSession() {
    if (this.sessionId) {
      try {
        await sensorDataService.endSession(this.sessionId);
        logger.info(
          `[DataProcessor ${this.port}] ✅ Session ended: ${this.sessionId}, Records: ${this.recordCount}`,
        );
      } catch (err) {
        logger.error(`[DataProcessor ${this.port}] ❌ Failed to end session:`, err);
      }
    }
  }

  getRecordCount(): number {
    return this.recordCount;
  }
}
