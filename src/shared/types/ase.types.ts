// src/shared/types/ase.types.ts

/**
 * Параметры ASE-источника, прочитанные командой 0xD1.
 */
export interface AseInfo {
  unit: number;
  maxSetting: number;
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
 * Результат установки мощности.
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
 * API управления ASE-источником (Renderer Process).
 */
export interface AseAPI {
  connect: (path: string) => Promise<AseResult>;
  disconnect: () => Promise<AseResult>;
  getInfo: () => Promise<AseInfoResult>;
  setPower: (mW: number) => Promise<AsePowerResult>;
  setEnabled: (enabled: boolean) => Promise<AseResult>;
  isConnected: () => Promise<boolean>;
  onClosed: (callback: (port: string) => void) => () => void;
  onError: (callback: (event: AseErrorEvent) => void) => () => void;
}
