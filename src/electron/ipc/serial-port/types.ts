import EventEmitter from "events";

export enum SerialChannels {
  GetPorts = 'serial:getPorts',
  Open = 'serial:open',
  Close = 'serial:close',
  Data = 'serial:data',
  Closed = 'serial:closed',
}

export enum AppChannels {
  Ready = 'app:ready',
  SettingsGet = 'app:settings:get',
  SettingsSet = 'app:settings:set',
}

export interface SerialDataEvent {
  port: string;
  data: string;
}
export interface SerialOpenResult {
  ok?: boolean;
  error?: string;
}

export interface SerialPortInfo {
  path: string;
  manufacturer?: string;
  serialNumber?: string;
  vendorId?: string;
  productId?: string;
  busy: boolean;
}

export interface ISerialPort extends EventEmitter {
  path: string;
  baudRate: number;
  isOpen: boolean;
  close: (callback?: (error?: Error | null) => void) => void;
  on(event: 'data', listener: (data: Buffer) => void): this;
  on(event: 'close', listener: () => void): this;
  on(event: 'error', listener: (err: Error) => void): this;
  on(event: string | symbol, listener: (...args: any[]) => void): this;
}