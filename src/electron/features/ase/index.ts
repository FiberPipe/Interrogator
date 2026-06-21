// src/electron/features/ase/index.ts

// ==================== TYPES ====================
export { AseIPC } from './ase.types';
export type {
  AseInfo,
  AseResult,
  AseInfoResult,
  AsePowerResult,
  AseErrorEvent,
  IAsePort,
} from './ase.types';

// ==================== CONSTANTS ====================
export { ASE_CMD, ASE_INFO_OFFSETS, ASE_SERIAL, RX_HEADER, TX_HEADER } from './ase.constants';

// ==================== PROTOCOL ====================
export {
  crc,
  buildFrame,
  buildResponseFrame,
  buildInfoRequest,
  buildEnableRequest,
  buildPowerRequest,
  parseResponse,
  parseRequest,
  parseInfo,
  mwToRaw,
} from './ase.protocol';

// ==================== SERVICE ====================
export { AseService } from './ase.service';
export { AsePort } from './ase.port';
export { createAsePort } from './ase.port.factory';

// ==================== EMULATOR ====================
export { AseDevice } from './ase.device';
export type { AseDeviceConfig, AseDeviceState } from './ase.device';
export { MockAsePort } from './services/mock-ase-port.service';

// ==================== API (Renderer) ====================
export { aseAPI } from './ase.api';

// ==================== IPC (Main) ====================
export { registerAseIpc } from './ase.ipc';
