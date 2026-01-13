export interface SerialPortInfo {
  path: string;
  manufacturer?: string;
  serialNumber?: string;
  vendorId?: string;
  productId?: string;
  busy: boolean;
}

export interface SerialDataPacket {
  id: string;
  time: string;
  timestamp: number;
  [key: string]: any;
}

export interface SerialConnectionState {
  ports: SerialPortInfo[];
  selectedPort: string | null;
  connectedPort: string | null;
  loading: boolean;
  connecting: boolean;
  error: string | null;
  autoConnect: boolean;
  lastData: SerialDataPacket | null;
  dataBuffer: SerialDataPacket[];
  packetsReceived: number;
}
