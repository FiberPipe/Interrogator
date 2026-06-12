// src/shared/api/serial.api.ts

import type {
  SerialPortInfo,
  SerialOpenResult,
  SerialDataEvent,
  SerialErrorEvent,
  SerialAutoConnectErrorEvent,
} from '../types/serial.types';

/**
 * Проверка доступности serial API
 */
const isSerialAvailable = (): boolean => {
  return typeof window !== 'undefined' && window?.electron.serial !== undefined;
};

export const serialApi = {
  /**
   * Получить список портов
   */
  async getPorts(): Promise<SerialPortInfo[]> {
    if (!isSerialAvailable()) {
      console.error('Serial API is not available');
      return [];
    }
    return window.electron.serial.getPorts();
  },

  /**
   * Открыть порт
   */
  async open(path: string, baudRate?: number): Promise<SerialOpenResult> {
    if (!isSerialAvailable()) {
      console.error('Serial API is not available');
      return { error: 'API not available' };
    }
    return window.electron.serial.open(path, baudRate);
  },

  /**
   * Закрыть порт
   */
  async close(path: string): Promise<SerialOpenResult> {
    if (!isSerialAvailable()) {
      console.error('Serial API is not available');
      return { error: 'API not available' };
    }
    return window.electron.serial.close(path);
  },

  /**
   * Установить окно усреднения по времени (сек)
   */
  async setAveraging(avgSec: number): Promise<{ ok: boolean }> {
    if (!isSerialAvailable()) {
      console.error('Serial API is not available');
      return { ok: false };
    }
    return window.electron.serial.setAveraging(avgSec);
  },

  /**
   * Получить текущее окно усреднения (сек)
   */
  async getAveraging(): Promise<number> {
    if (!isSerialAvailable()) {
      console.error('Serial API is not available');
      return 1.0;
    }
    return window.electron.serial.getAveraging();
  },

  /**
   * Подписаться на данные
   */
  onData(callback: (event: SerialDataEvent) => void): () => void {
    if (!isSerialAvailable()) {
      console.error('Serial API is not available');
      return () => {};
    }
    return window.electron.serial.onData(callback);
  },

  /**
   * Подписаться на закрытие порта
   */
  onClosed(callback: (port: string) => void): () => void {
    if (!isSerialAvailable()) {
      console.error('Serial API is not available');
      return () => {};
    }
    return window.electron.serial.onClosed(callback);
  },

  /**
   * Подписаться на ошибки порта
   */
  onError(callback: (event: SerialErrorEvent) => void): () => void {
    if (!isSerialAvailable()) {
      console.error('Serial API is not available');
      return () => {};
    }
    return window.electron.serial.onError(callback);
  },

  /**
   * Подписаться на событие "нет сохраненного порта"
   */
  onAutoConnectNone(callback: () => void): () => void {
    if (!isSerialAvailable()) {
      console.error('Serial API is not available');
      return () => {};
    }
    return window.electron.serial.onAutoConnectNone(callback);
  },

  /**
   * Подписаться на событие "порт не найден"
   */
  onAutoConnectFailed(callback: (port: string) => void): () => void {
    if (!isSerialAvailable()) {
      console.error('Serial API is not available');
      return () => {};
    }
    return window.electron.serial.onAutoConnectFailed(callback);
  },

  /**
   * Подписаться на успешное автоподключение
   */
  onAutoConnected(callback: (port: string) => void): () => void {
    if (!isSerialAvailable()) {
      console.error('Serial API is not available');
      return () => {};
    }
    return window.electron.serial.onAutoConnected(callback);
  },

  /**
   * Подписаться на ошибку автоподключения
   */
  onAutoConnectError(callback: (event: SerialAutoConnectErrorEvent) => void): () => void {
    if (!isSerialAvailable()) {
      console.error('Serial API is not available');
      return () => {};
    }
    return window.electron.serial.onAutoConnectError(callback);
  },
};
