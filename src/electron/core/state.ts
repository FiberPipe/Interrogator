// src/electron/core/state.ts

import type { ISerialPortManager } from '../features/serial';

export let portManager: ISerialPortManager | null = null;

export function setPortManager(manager: ISerialPortManager): void {
  portManager = manager;
}

export function getPortManager(): ISerialPortManager {
  if (portManager === null) {
    throw new Error('PortManager not initialized');
  }
  return portManager;
}
