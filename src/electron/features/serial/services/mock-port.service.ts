// src/electron/features/serial/services/mock-port.service.ts

import { EventEmitter } from 'node:events';

import type { ISerialPort, SerialPortInfo } from '../serial.types';
import { MOCK_PORTS, TIMEOUTS, DATA_PROCESSING } from '../serial.constants';
import { extractPortIndex } from '../serial.utils';
import { logger } from '../../logger';

export class MockSerialPort extends EventEmitter implements ISerialPort {
  public path: string;
  public baudRate: number;
  public isOpen: boolean;

  private interval?: NodeJS.Timeout;
  private recordId: number;
  private portIndex: number;

  constructor(path: string, baudRate: number) {
    super();

    this.path = path;
    this.baudRate = baudRate;
    this.isOpen = true;
    this.recordId = 0;
    this.portIndex = extractPortIndex(path);

    logger.info('Serial', 'Mock port created', {
      path,
      baudRate,
      portIndex: this.portIndex,
    });

    // Задержка перед началом отправки данных
    setTimeout(() => {
      if (this.isOpen) {
        this.startSendingData();
      }
    }, TIMEOUTS.MOCK_INIT_DELAY);
  }

  /**
   * Генерация mock данных
   */
  private generateMockData(): Record<string, unknown> {
    const data: Record<string, unknown> = {
      id: `record_${this.recordId}`,
      time: new Date().toISOString().substring(11, 23),
    };

    // Генерируем данные для каналов
    for (let i = 0; i < DATA_PROCESSING.CHANNELS_COUNT; i++) {
      const baseValue = 1.8 + this.portIndex * 0.2 + i * 0.02 + (Math.random() * 0.4 - 0.2);
      data[`P${i}`] = parseFloat(baseValue.toFixed(6));
      data[`stdDev${i}`] = parseFloat((0.01 + Math.random() * 0.01).toFixed(6));
    }

    return data;
  }

  /**
   * Начать отправку данных
   */
  private startSendingData(): void {
    if (!this.isOpen) {
      logger.debug('Serial', 'Port is closed, not starting data transmission', {
        path: this.path,
      });
      return;
    }

    logger.info('Serial', 'Starting mock data transmission', {
      path: this.path,
      interval: TIMEOUTS.MOCK_DATA_INTERVAL,
    });

    // Отправляем первый пакет сразу
    this.sendDataPacket();

    // Настраиваем интервал
    this.interval = setInterval(() => {
      if (this.isOpen) {
        this.sendDataPacket();
      } else {
        this.stopSendingData();
      }
    }, TIMEOUTS.MOCK_DATA_INTERVAL);
  }

  /**
   * Остановить отправку данных
   */
  private stopSendingData(): void {
    if (this.interval !== undefined) {
      clearInterval(this.interval);
      this.interval = undefined;

      logger.debug('Serial', 'Mock data transmission stopped', {
        path: this.path,
      });
    }
  }

  /**
   * Отправить пакет данных
   */
  private sendDataPacket(): void {
    if (!this.isOpen) return;

    this.recordId++;
    const mockData = this.generateMockData();
    const dataString = JSON.stringify(mockData) + '\n';

    logger.debug('Serial', 'Sending mock data packet', {
      path: this.path,
      recordId: this.recordId,
    });

    // Используем setImmediate для эмуляции асинхронности
    setImmediate(() => {
      if (this.isOpen) {
        this.emit('data', Buffer.from(dataString));
      }
    });
  }

  /**
   * Закрыть порт
   */
  public close(callback?: (error?: Error | null) => void): void {
    logger.info('Serial', 'Closing mock port', {
      path: this.path,
      isOpen: this.isOpen,
    });

    if (!this.isOpen) {
      logger.debug('Serial', 'Mock port already closed', { path: this.path });
      if (callback !== undefined) {
        callback(null);
      }
      return;
    }

    this.isOpen = false;
    this.stopSendingData();

    // Эмулируем задержку закрытия порта
    setTimeout(() => {
      logger.info('Serial', 'Mock port closed successfully', { path: this.path });

      this.emit('close');

      if (callback !== undefined) {
        callback(null);
      }

      // Удаляем все слушатели
      this.removeAllListeners();
    }, 50);
  }
}

/**
 * Создать mock Serial порт
 */
export function createMockSerialPort(path: string, baudRate: number): ISerialPort {
  return new MockSerialPort(path, baudRate);
}

/**
 * Получить список mock портов
 */
export async function getMockSerialPorts(): Promise<SerialPortInfo[]> {
  return MOCK_PORTS.map((port) => ({
    ...port,
    busy: false,
  }));
}
