// src/electron/features/ase/index.ts

// ==================== TYPES ====================
export { AseIPC } from './ase.types';
export type {
  AseInfo,
  AseResult,
  AseInfoResult,
  AsePowerResult,
  AseErrorEvent,
} from './ase.types';

// ==================== CONSTANTS ====================
export { ASE_CMD, ASE_INFO_OFFSETS, ASE_SERIAL, RX_HEADER, TX_HEADER } from './ase.constants';

// ==================== PROTOCOL ====================
export {
  crc,
  buildFrame,
  buildInfoRequest,
  buildEnableRequest,
  buildPowerRequest,
  parseResponse,
  parseInfo,
  mwToRaw,
} from './ase.protocol';

// ==================== SERVICE ====================
export { AseService } from './ase.service';
export { AsePort } from './ase.port';

// ==================== API (Renderer) ====================
export { aseAPI } from './ase.api';

// ==================== IPC (Main) ====================
export { registerAseIpc } from './ase.ipc';
