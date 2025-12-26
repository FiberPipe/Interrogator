// src/preload/types.d.ts
export interface SerialPortInfo {
  path: string;
  manufacturer?: string;
  serialNumber?: string;
  vendorId?: string;
  productId?: string;
  busy: boolean;
}

export interface SerialOpenResult {
  ok?: boolean;
  error?: string;
}

export interface SerialDataEvent {
  port: string;
  data: string;
}

export interface SerialAPI {
  getPorts(): Promise<SerialPortInfo[]>;
  open(path: string, baud: number): Promise<SerialOpenResult>;
  close(path: string): Promise<SerialOpenResult>;
  onData(cb: (data: SerialDataEvent) => void): () => void;
  onClosed(cb: (port: string) => void): () => void;
  onError(cb: (data: { port: string; error: string }) => void): () => void;
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
