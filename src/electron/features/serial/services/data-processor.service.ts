// src/electron/features/serial/services/data-processor.service.ts

import type { BrowserWindow } from 'electron';

import type {
  IDataProcessor,
  RawSensorData,
  ProcessedSensorData,
  CalibrationData,
  SensorMapping,
  ChannelRecord,
} from '../serial.types';
import { DATA_PROCESSING, STORAGE_KEYS } from '../serial.constants';
import { parseSerialData, safeParseFloat } from '../serial.utils';
import { sensorDataService } from '../../database';
import { logger } from '../../logger';
import { createError } from '../../../../shared/errors';
import { ErrorCodes } from '../../../../shared/errors/error-codes';
import { appDataStorage } from '../../app-data';

export class DataProcessorService implements IDataProcessor {
  private sessionId: number | null = null;
  private recordCount = 0;
  private lastSaveTime = Date.now();

  constructor(
    private readonly port: string,
    private readonly win: BrowserWindow,
  ) {}

  /**
   * Начать сессию
   */
  async startSession(): Promise<void> {
    return logger.withLogging(
      'DataProcessor',
      'Start session',
      async () => {
        try {
          this.sessionId = await sensorDataService.createSession(this.port);

          logger.info('DataProcessor', 'Session started successfully', {
            port: this.port,
            sessionId: this.sessionId,
          });
        } catch (err) {
          throw createError({
            code: ErrorCodes.DB_WRITE_FAILED,
            title: 'Session Start Failed',
            description: 'Failed to create data processing session',
            meta: { port: this.port },
            cause: err,
            area: 'DataProcessor',
          });
        }
      },
      { port: this.port },
    );
  }

  /**
   * Обработать данные
   */
  async processData(dataString: string): Promise<void> {
    try {
      // 1. Парсим данные
      const rawData = parseSerialData<RawSensorData>(dataString);
      if (rawData === null) {
        logger.warn('DataProcessor', 'Failed to parse data', {
          port: this.port,
          dataString: dataString.substring(0, 100),
        });
        return;
      }

      // 2. Получаем калибровку и маппинг
      const calibrationData = this.getCalibrationData();
      const sensorMappings = this.getSensorMappings();

      // 3. Нормализуем данные
      const normalized = this.normalizeData(rawData, calibrationData);

      // 4. Вычисляем wavelengths
      const wavelengths = this.calculateWavelengths(normalized, calibrationData, sensorMappings);

      // 5. Формируем итоговый пакет
      const processedData: ProcessedSensorData = {
        ...rawData,
        normalized,
        wavelengths,
      };

      // 6. Отправляем на клиент
      this.sendToClient(processedData);

      // 7. Сохраняем в БД
      await this.saveToDatabase(processedData);

      this.recordCount++;
    } catch (err) {
      logger.error('DataProcessor', 'Data processing error', { port: this.port }, err);
    }
  }

  /**
   * Завершить сессию
   */
  async endSession(): Promise<void> {
    return logger.withLogging(
      'DataProcessor',
      'End session',
      async () => {
        if (this.sessionId === null) {
          logger.warn('DataProcessor', 'No active session to end', {
            port: this.port,
          });
          return;
        }

        try {
          await sensorDataService.endSession(this.sessionId);

          logger.info('DataProcessor', 'Session ended successfully', {
            port: this.port,
            sessionId: this.sessionId,
            recordCount: this.recordCount,
          });
        } catch (err) {
          throw createError({
            code: ErrorCodes.DB_WRITE_FAILED,
            title: 'Session End Failed',
            description: 'Failed to end data processing session',
            meta: { port: this.port, sessionId: this.sessionId },
            cause: err,
            area: 'DataProcessor',
          });
        }
      },
      { port: this.port, sessionId: this.sessionId },
    );
  }

  /**
   * Получить количество записей
   */
  getRecordCount(): number {
    return this.recordCount;
  }

  /**
   * Получить калибровочные данные
   */
  private getCalibrationData(): CalibrationData {
    const data = appDataStorage.get<CalibrationData>(STORAGE_KEYS.CALIBRATION_DATA);

    return (
      data ?? {
        normalization: {},
        wavelengths: {},
      }
    );
  }

  /**
   * Получить маппинг датчиков
   */
  private getSensorMappings(): SensorMapping[] {
    const sensorConfig = appDataStorage.get<Record<number, Partial<SensorMapping>>>(
      STORAGE_KEYS.SENSOR_CONFIG,
    );
    const sensorCount = appDataStorage.get<number>(STORAGE_KEYS.SENSOR_COUNT);

    if (sensorConfig === undefined || sensorCount === undefined || sensorCount === 0) {
      return [];
    }

    const mappings: SensorMapping[] = [];

    for (let i = 0; i < sensorCount; i++) {
      const config = sensorConfig[i];
      if (config !== undefined) {
        mappings.push({
          index: i,
          type: config.type ?? '',
          channels: config.channels ?? [],
          alias: config.alias ?? `Sensor ${i}`,
        });
      }
    }

    return mappings;
  }

  /**
   * Нормализация данных
   */
  private normalizeData(
    rawData: RawSensorData,
    calibration: CalibrationData,
  ): Record<string, number> {
    const normalized: Record<string, number> = {};

    for (let i = 0; i < DATA_PROCESSING.CHANNELS_COUNT; i++) {
      const key = `P${i}`;
      const rawValue = safeParseFloat(rawData[key], 0);
      const normValue = safeParseFloat(calibration.normalization[`field${i}`], 0);

      normalized[key] = Math.max(0, rawValue - normValue);
    }

    return normalized;
  }

  /**
   * Вычисление wavelengths
   */
  private calculateWavelengths(
    normalized: Record<string, number>,
    calibration: CalibrationData,
    sensors: SensorMapping[],
  ): Record<string, number> {
    const wavelengths: Record<string, number> = {};

    for (const sensor of sensors) {
      const { index, channels } = sensor;

      // Минимум 2 канала для расчета
      if (channels.length < DATA_PROCESSING.MIN_CHANNELS_FOR_WAVELENGTH) {
        wavelengths[`wavelength${index}`] = NaN;
        continue;
      }

      // Получаем веса и центральные длины волн
      const weights = channels.map((ch) => normalized[ch] ?? 0);
      const lambdas = channels.map((ch) => {
        const chIndex = parseInt(ch.replace('P', ''), 10);
        return safeParseFloat(calibration.wavelengths[`lambdas_central${chIndex}`], 0);
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

  /**
   * Отправить данные на клиент
   */
  private sendToClient(data: ProcessedSensorData): void {
    this.win.webContents.send('serial:data', {
      port: this.port,
      data: JSON.stringify(data),
    });
  }

  /**
   * Сохранить в БД
   */
  private async saveToDatabase(data: ProcessedSensorData): Promise<void> {
    try {
      // Извлекаем данные по каналам
      const channels: ChannelRecord[] = [];

      for (let i = 0; i < DATA_PROCESSING.CHANNELS_COUNT; i++) {
        const pKey = `P${i}`;
        const stdDevKey = `stdDev${i}`;

        channels.push({
          channel: i,
          value: safeParseFloat(data[pKey], 0),
          normalized: data.normalized[pKey] ?? 0,
          stdDev: safeParseFloat(data[stdDevKey], 0),
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
      if (
        now - this.lastSaveTime > DATA_PROCESSING.SAVE_INTERVAL &&
        this.sessionId !== null
      ) {
        await sensorDataService.incrementSessionRecords(this.sessionId);
        this.lastSaveTime = now;
      }
    } catch (err) {
      logger.error('DataProcessor', 'Database save error', { port: this.port }, err);
      throw err;
    }
  }
}

/**
 * Создать процессор данных
 */
export function createDataProcessor(port: string, win: BrowserWindow): IDataProcessor {
  return new DataProcessorService(port, win);
}
