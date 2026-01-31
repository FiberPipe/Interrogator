// src/electron/features/serial/serial.api.ts

import { ipcRenderer } from 'electron';

import type {
  SerialPortInfo,
  SerialOpenResult,
  SerialDataEvent,
  SerialErrorEvent,
  SerialAutoConnectErrorEvent,
} from './serial.types';
import { SerialIPC } from './serial.types';
import type { SerialAPI } from '../../../shared/types/serial.types';

export const serialAPI: SerialAPI = {
  /**
   * Получить список портов
   */
  getPorts(): Promise<SerialPortInfo[]> {
    return ipcRenderer.invoke(SerialIPC.GetPorts);
  },

  /**
   * Открыть порт
   */
  open(path: string, baudRate?: number): Promise<SerialOpenResult> {
    return ipcRenderer.invoke(SerialIPC.Open, path, baudRate);
  },

  /**
   * Закрыть порт
   */
  close(path: string): Promise<SerialOpenResult> {
    return ipcRenderer.invoke(SerialIPC.Close, path);
  },

  /**
   * Подписаться на данные
   */
  onData(callback: (event: SerialDataEvent) => void): () => void {
    const listener = (_: unknown, data: SerialDataEvent): void => callback(data);
    ipcRenderer.on(SerialIPC.Data, listener);
    return () => ipcRenderer.removeListener(SerialIPC.Data, listener);
  },

  /**
   * Подписаться на закрытие порта
   */
  onClosed(callback: (port: string) => void): () => void {
    const listener = (_: unknown, port: string): void => callback(port);
    ipcRenderer.on(SerialIPC.Closed, listener);
    return () => ipcRenderer.removeListener(SerialIPC.Closed, listener);
  },

  /**
   * Подписаться на ошибки порта
   */
  onError(callback: (event: SerialErrorEvent) => void): () => void {
    const listener = (_: unknown, event: SerialErrorEvent): void => callback(event);
    ipcRenderer.on(SerialIPC.Error, listener);
    return () => ipcRenderer.removeListener(SerialIPC.Error, listener);
  },

  /**
   * Подписаться на событие "нет сохраненного порта"
   */
  onAutoConnectNone(callback: () => void): () => void {
    const listener = (): void => callback();
    ipcRenderer.on(SerialIPC.AutoConnectNone, listener);
    return () => ipcRenderer.removeListener(SerialIPC.AutoConnectNone, listener);
  },

  /**
   * Подписаться на событие "порт не найден"
   */
  onAutoConnectFailed(callback: (port: string) => void): () => void {
    const listener = (_: unknown, port: string): void => callback(port);
    ipcRenderer.on(SerialIPC.AutoConnectFailed, listener);
    return () => ipcRenderer.removeListener(SerialIPC.AutoConnectFailed, listener);
  },

  /**
   * Подписаться на успешное автоподключение
   */
  onAutoConnected(callback: (port: string) => void): () => void {
    const listener = (_: unknown, port: string): void => callback(port);
    ipcRenderer.on(SerialIPC.AutoConnected, listener);
    return () => ipcRenderer.removeListener(SerialIPC.AutoConnected, listener);
  },

  /**
   * Подписаться на ошибку автоподключения
   */
  onAutoConnectError(callback: (event: SerialAutoConnectErrorEvent) => void): () => void {
    const listener = (_: unknown, event: SerialAutoConnectErrorEvent): void => callback(event);
    ipcRenderer.on(SerialIPC.AutoConnectError, listener);
    return () => ipcRenderer.removeListener(SerialIPC.AutoConnectError, listener);
  },
};
