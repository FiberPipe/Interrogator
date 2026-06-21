// src/shared/api/ase.api.ts

import type {
  AseErrorEvent,
  AseInfoResult,
  AsePowerResult,
  AseResult,
  AseStateEvent,
  AseTrafficEvent,
} from '../types/ase.types';

/**
 * Проверка доступности ASE API.
 */
const isAseAvailable = (): boolean => {
  return typeof window !== 'undefined' && window?.electron.ase !== undefined;
};

export const aseApi = {
  async connect(path: string): Promise<AseResult> {
    if (!isAseAvailable()) {
      console.error('ASE API is not available');
      return { error: 'API not available' };
    }
    return window.electron.ase.connect(path);
  },

  async disconnect(): Promise<AseResult> {
    if (!isAseAvailable()) {
      console.error('ASE API is not available');
      return { error: 'API not available' };
    }
    return window.electron.ase.disconnect();
  },

  async getInfo(): Promise<AseInfoResult> {
    if (!isAseAvailable()) {
      console.error('ASE API is not available');
      return { error: 'API not available' };
    }
    return window.electron.ase.getInfo();
  },

  async setPower(mW: number): Promise<AsePowerResult> {
    if (!isAseAvailable()) {
      console.error('ASE API is not available');
      return { error: 'API not available' };
    }
    return window.electron.ase.setPower(mW);
  },

  async setEnabled(enabled: boolean): Promise<AseResult> {
    if (!isAseAvailable()) {
      console.error('ASE API is not available');
      return { error: 'API not available' };
    }
    return window.electron.ase.setEnabled(enabled);
  },

  async isConnected(): Promise<boolean> {
    if (!isAseAvailable()) {
      return false;
    }
    return window.electron.ase.isConnected();
  },

  onClosed(callback: (port: string) => void): () => void {
    if (!isAseAvailable()) {
      console.error('ASE API is not available');
      return () => {};
    }
    return window.electron.ase.onClosed(callback);
  },

  onError(callback: (event: AseErrorEvent) => void): () => void {
    if (!isAseAvailable()) {
      console.error('ASE API is not available');
      return () => {};
    }
    return window.electron.ase.onError(callback);
  },

  onData(callback: (event: AseTrafficEvent) => void): () => void {
    if (!isAseAvailable()) {
      console.error('ASE API is not available');
      return () => {};
    }
    return window.electron.ase.onData(callback);
  },

  onState(callback: (event: AseStateEvent) => void): () => void {
    if (!isAseAvailable()) {
      console.error('ASE API is not available');
      return () => {};
    }
    return window.electron.ase.onState(callback);
  },
};
