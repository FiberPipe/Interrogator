import type { SerialPortInfo } from '../../shared/types/serial';

export interface SerialAPI {
  getPorts(): Promise<SerialPortInfo[]>;
  open(path: string, baud: number): Promise<void>;
  close(path: string): Promise<void>;
  onData(cb: (data: unknown) => void): void;
  onClosed(cb: (port: string) => void): void;
}

export interface AppDataAPI {
  getAll(): Promise<Record<string, unknown>>;
  set(key: string, value: unknown): Promise<void>;
  delete(key: string): Promise<void>;
  patch(patch: Record<string, unknown>): Promise<void>;
}

declare global {
  interface Window {
    serial: SerialAPI;
    appData: AppDataAPI;
  }
}

export {};
