// src/main/serial/mock-serial.ts
import { EventEmitter } from 'events';

import type { ISerialPort } from './types';
import { logger } from '../logger/utils';

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
    this.portIndex = parseInt(path.match(/\d+$/)?.[0] || '0');

    logger.info(`[Mock Serial] Creating port ${path} with index ${this.portIndex}`);

    // Задержка перед началом отправки данных
    setTimeout(() => {
      if (this.isOpen) {
        this.startSendingData();
      }
    }, 200);
  }

  private generateMockData() {
    const data: Record<string, any> = {
      id: `record_${this.recordId}`,
      time: new Date().toISOString().substr(11, 12),
    };

    // Генерируем данные для 16 каналов
    for (let i = 0; i < 16; i++) {
      const baseValue = 1.8 + this.portIndex * 0.2 + i * 0.02 + (Math.random() * 0.4 - 0.2);
      data[`P${i}`] = parseFloat(baseValue.toFixed(6));
      data[`stdDev${i}`] = parseFloat((0.01 + Math.random() * 0.01).toFixed(6));
    }

    return data;
  }

  private startSendingData() {
    if (!this.isOpen) {
      logger.info(`[Mock Serial ${this.path}] Port is closed, not starting data transmission`);
      return;
    }

    logger.info(`[Mock Serial ${this.path}] Starting to send data every 1000ms`);

    // Отправляем первый пакет сразу
    this.sendDataPacket();

    // Затем настраиваем интервал
    this.interval = setInterval(() => {
      if (this.isOpen) {
        this.sendDataPacket();
      } else {
        logger.info(`[Mock Serial ${this.path}] Port closed, stopping data transmission`);
        if (this.interval) {
          clearInterval(this.interval);
          this.interval = undefined;
        }
      }
    }, 1000);
  }

  private sendDataPacket() {
    if (!this.isOpen) return;

    this.recordId++;
    const mockData = this.generateMockData();
    const dataString = JSON.stringify(mockData) + '\n';

    logger.info(`[Mock Serial ${this.path}] Sending data #${this.recordId}`);

    // Используем setImmediate для эмуляции асинхронности
    setImmediate(() => {
      if (this.isOpen) {
        this.emit('data', Buffer.from(dataString));
      }
    });
  }

  public close(callback?: (error?: Error | null) => void): void {
    logger.info(`[Mock Serial ${this.path}] Closing port (isOpen: ${this.isOpen})`);

    if (!this.isOpen) {
      logger.info(`[Mock Serial ${this.path}] Port already closed`);
      if (callback) {
        callback(null);
      }
      return;
    }

    this.isOpen = false;

    // Останавливаем интервал
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }

    // Эмулируем задержку закрытия порта
    setTimeout(() => {
      logger.info(`[Mock Serial ${this.path}] Port closed successfully`);
      this.emit('close');
      if (callback) {
        callback(null);
      }

      // Удаляем все слушатели
      this.removeAllListeners();
    }, 50);
  }
}

export function createMockSerialPort(path: string, baudRate: number): ISerialPort {
  return new MockSerialPort(path, baudRate);
}

export async function getMockSerialPorts() {
  return [
    {
      path: '/dev/ttyUSB0',
      manufacturer: 'FTDI (Mock)',
      serialNumber: 'MOCK001',
      vendorId: '0403',
      productId: '6001',
    },
    {
      path: '/dev/ttyUSB1',
      manufacturer: 'FTDI (Mock)',
      serialNumber: 'MOCK002',
      vendorId: '0403',
      productId: '6001',
    },
    {
      path: '/dev/ttyUSB2',
      manufacturer: 'FTDI (Mock)',
      serialNumber: 'MOCK003',
      vendorId: '0403',
      productId: '6001',
    },
  ];
}
