import type { SerialPortInfo } from './serial';

export interface SerialAPI {
  getPorts(): Promise<SerialPortInfo[]>;
  open(path: string, baud: number): Promise<any>;
  close(path: string): Promise<any>;
  onData(cb: (data: any) => void): void;
  onClosed(cb: (port: string) => void): void;
}

declare global {
  interface Window {
    serial: SerialAPI;
  }
}
