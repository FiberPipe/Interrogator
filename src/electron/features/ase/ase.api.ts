// src/electron/features/ase/ase.api.ts

import { ipcRenderer } from 'electron';

import { AseIPC } from './ase.types';
import type { AseErrorEvent } from './ase.types';
import type { AseAPI } from '../../../shared/types/ase.types';

export const aseAPI: AseAPI = {
  connect(path: string) {
    return ipcRenderer.invoke(AseIPC.Connect, path);
  },

  disconnect() {
    return ipcRenderer.invoke(AseIPC.Disconnect);
  },

  getInfo() {
    return ipcRenderer.invoke(AseIPC.GetInfo);
  },

  setPower(mW: number) {
    return ipcRenderer.invoke(AseIPC.SetPower, mW);
  },

  setEnabled(enabled: boolean) {
    return ipcRenderer.invoke(AseIPC.SetEnabled, enabled);
  },

  isConnected() {
    return ipcRenderer.invoke(AseIPC.IsConnected);
  },

  onClosed(callback: (port: string) => void): () => void {
    const listener = (_: unknown, port: string): void => callback(port);
    ipcRenderer.on(AseIPC.Closed, listener);
    return () => ipcRenderer.removeListener(AseIPC.Closed, listener);
  },

  onError(callback: (event: AseErrorEvent) => void): () => void {
    const listener = (_: unknown, event: AseErrorEvent): void => callback(event);
    ipcRenderer.on(AseIPC.Error, listener);
    return () => ipcRenderer.removeListener(AseIPC.Error, listener);
  },
};
