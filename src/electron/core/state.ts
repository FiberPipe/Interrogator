import type { SerialPortManager } from '../features/serial/port-manager';

export let portManager: SerialPortManager | null = null;

export function setPortManager(manager: SerialPortManager): void {
  portManager = manager;
}

export function getPortManager(): SerialPortManager {
  if (!portManager) {
    throw new Error('PortManager not initialized');
  }
  return portManager;
}
