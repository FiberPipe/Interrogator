// src/electron/features/serial/serial.types.ts

import type EventEmitter from 'node:events';

/**
 * IPC каналы для работы с Serial
 */
export enum SerialIPC {
  GetPorts = 'serial:getPorts',
  Open = 'serial:open',
  Close = 'serial:close',
  Data = 'serial:data',
  Closed = 'serial:closed',
  Error = 'serial:error',
  AutoConnectNone = 'serial:auto-connect-none',
  AutoConnectFailed = 'serial:auto-connect-failed',
  AutoConnected = 'serial:auto-connected',
  AutoConnectError = 'serial:auto-connect-error',
}

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
 * Событие автоподключения
 */
export interface SerialAutoConnectErrorEvent {
  port: string;
  error: string;
}

/**
 * Интерфейс Serial порта
 */
export interface ISerialPort extends EventEmitter {
  path: string;
  baudRate: number;
  isOpen: boolean;
  close: (callback?: (error?: Error | null) => void) => void;
  on(event: 'data', listener: (data: Buffer) => void): this;
  on(event: 'close', listener: () => void): this;
  on(event: 'error', listener: (err: Error) => void): this;
  on(event: string | symbol, listener: (...args: unknown[]) => void): this;
}

/**
 * Подключение к порту
 */
export interface PortConnection {
  port: ISerialPort;
  processor: IDataProcessor;
}

/**
 * Интерфейс обработчика данных
 */
export interface IDataProcessor {
  startSession(): Promise<void>;
  processData(dataString: string): Promise<void>;
  endSession(): Promise<void>;
  getRecordCount(): number;
}

/**
 * Конфигурация Serial
 */
export interface SerialConfig {
  defaultBaudRate: number;
  autoConnect: boolean;
  useMockPorts: boolean;
}

/**
 * Настройки автосохранения
 */
export interface AutoSaveSettings {
  lastPort: string;
  baudRate: number;
}

/**
 * Сырые данные с датчика
 */
export interface RawSensorData {
  id: string;
  time: string;
  [key: string]: unknown;
}

/**
 * Обработанные данные
 */
export interface ProcessedSensorData extends RawSensorData {
  normalized: Record<string, number>;
  wavelengths: Record<string, number>;
}

/**
 * Калибровочные данные
 */
export interface CalibrationData {
  normalization: Record<string, number>; // field0-15
  wavelengths: Record<string, number>; // lambdas_central0-15
}

/**
 * Маппинг датчика
 */
export interface SensorMapping {
  index: number;
  type: string;
  channels: string[]; // ['P0', 'P1', 'P2', 'P3']
  alias?: string;
}

/**
 * Запись канала
 */
export interface ChannelRecord {
  channel: number;
  value: number;
  normalized: number;
  stdDev: number;
}

/**
 * Менеджер портов
 */
export interface ISerialPortManager {
  isPortOpen(path: string): boolean;
  getConnection(path: string): PortConnection | undefined;
  openPort(path: string, port: ISerialPort): Promise<void>;
  closePort(path: string): Promise<void>;
  closeAllPorts(): Promise<void>;
  switchPort(fromPath: string | null, toPath: string, newPort: ISerialPort): Promise<void>;
  getActivePorts(): string[];
}
