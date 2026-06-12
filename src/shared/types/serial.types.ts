// src/shared/types/serial.types.ts

/**
 * Информация о Serial порте
 */
export interface SerialPortInfo {
  path: string;
  manufacturer?: string;
  serialNumber?: string;
  vendorId?: string;
  productId?: string;
  busy: boolean;
}

/**
 * Результат операции открытия порта
 */
export interface SerialOpenResult {
  ok?: boolean;
  error?: string;
}

/**
 * Событие получения данных
 */
export interface SerialDataEvent {
  port: string;
  data: string;
}

/**
 * Событие ошибки порта
 */
export interface SerialErrorEvent {
  port: string;
  error: string;
}

/**
 * Событие ошибки автоподключения
 */
export interface SerialAutoConnectErrorEvent {
  port: string;
  error: string;
}

/**
 * API для работы с Serial (Renderer Process)
 */
export interface SerialAPI {
  getPorts: () => Promise<SerialPortInfo[]>;
  open: (path: string, baudRate?: number) => Promise<SerialOpenResult>;
  close: (path: string) => Promise<SerialOpenResult>;
  setAveraging: (avgSec: number) => Promise<{ ok: boolean }>;
  getAveraging: () => Promise<number>;
  onData: (callback: (event: SerialDataEvent) => void) => () => void;
  onClosed: (callback: (port: string) => void) => () => void;
  onError: (callback: (event: SerialErrorEvent) => void) => () => void;
  onAutoConnectNone: (callback: () => void) => () => void;
  onAutoConnectFailed: (callback: (port: string) => void) => () => void;
  onAutoConnected: (callback: (port: string) => void) => () => void;
  onAutoConnectError: (callback: (event: SerialAutoConnectErrorEvent) => void) => () => void;
}
