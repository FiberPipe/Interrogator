export type {
  SerialPortInfo,
  SerialOpenResult,
  SerialDataEvent,
  SerialErrorEvent,
  SerialAutoConnectErrorEvent,
  ISerialPort,
  ISerialPortManager,
  IDataProcessor,
  PortConnection,
  SerialConfig,
  RawSensorData,
  ProcessedSensorData,
  CalibrationData,
  SensorMapping,
  ChannelRecord,
} from './serial.types';

export { SerialIPC } from './serial.types';

// ==================== CONSTANTS ====================
export {
  DEFAULT_SERIAL_CONFIG,
  SUPPORTED_BAUD_RATES,
  TIMEOUTS,
  DATA_PROCESSING,
  MOCK_PORTS,
  STORAGE_KEYS,
} from './serial.constants';

// ==================== CONFIG ====================
export {
  SerialConfigManager,
  getSerialConfigManager,
  initializeSerialConfig,
} from './serial.config';

// ==================== UTILS ====================
export {
  cleanJSON,
  parseSerialData,
  isValidPortPath,
  formatPortName,
  extractPortIndex,
  createPortError,
  createTimeoutError,
  safeParseFloat,
  isValidNumber,
} from './serial.utils';

// ==================== API (Renderer) ====================
export { serialAPI } from './serial.api';

// ==================== IPC (Main) ====================
export { registerSerialIpc } from './serial.ipc';

// ==================== SERVICES ====================
export { createPortManager } from './services/port-manager.service';
export { createDataProcessor } from './services/data-processor.service';
export { createConnectionService } from './services/connection.service';
export {
  createMockSerialPort,
  getMockSerialPorts,
  MockSerialPort,
} from './services/mock-port.service';
