// src/electron/features/ase/ase.types.ts

/**
 * IPC каналы для управления ASE-источником.
 */
export enum AseIPC {
  Connect = 'ase:connect',
  Disconnect = 'ase:disconnect',
  GetInfo = 'ase:getInfo',
  SetPower = 'ase:setPower',
  SetEnabled = 'ase:setEnabled',
  IsConnected = 'ase:isConnected',
  Closed = 'ase:closed',
  Error = 'ase:error',
  Data = 'ase:data',
  State = 'ase:state',
}

/**
 * Актуальное состояние лазера, транслируемое в renderer (на каждое изменение
 * и периодически по heartbeat, пока порт подключён).
 */
export interface AseStateEvent {
  /** Излучение включено. */
  enabled: boolean;
  /** Текущее сырое значение мощности (подтверждённое устройством). */
  rawPower: number;
  /** Оптическая мощность в mW (rawPower / coeff). */
  powerMw: number;
}

/**
 * Событие обмена байтами с источником (для отображения «сырого» потока).
 * dir: 'tx' — отправлено в источник, 'rx' — получено от источника.
 */
export interface AseTrafficEvent {
  dir: 'tx' | 'rx';
  hex: string;
  ts: number;
}

/**
 * Параметры устройства, прочитанные командой 0xD1.
 */
export interface AseInfo {
  /** Код единицы измерения мощности (payload[17]). */
  unit: number;
  /** Максимально допустимая мощность в тех же единицах (payload[18] + 256*payload[19]). */
  maxSetting: number;
  /** Коэффициент перевода мощности в сырое значение (payload[23], 0 → 1). */
  coeff: number;
}

/**
 * Базовый результат операции.
 */
export interface AseResult {
  ok?: boolean;
  error?: string;
}

/**
 * Результат чтения параметров источника.
 */
export interface AseInfoResult extends AseResult {
  info?: AseInfo;
}

/**
 * Результат установки мощности (с фактически отправленным сырым значением).
 */
export interface AsePowerResult extends AseResult {
  raw?: number;
}

/**
 * Событие ошибки порта ASE.
 */
export interface AseErrorEvent {
  port: string;
  error: string;
}

/**
 * Абстракция транспорта ASE (реальный порт или in-process эмулятор).
 */
export interface IAsePort {
  readonly path: string;
  readonly isOpen: boolean;
  open: () => Promise<void>;
  sendCommand: (frame: Buffer) => Promise<Buffer>;
  close: () => Promise<void>;
}

/**
 * Колбэки жизненного цикла порта ASE.
 */
export type AsePortClosedHandler = (path: string) => void;
export type AsePortErrorHandler = (path: string, error: string) => void;
