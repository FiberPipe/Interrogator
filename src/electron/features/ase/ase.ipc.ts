// src/electron/features/ase/ase.ipc.ts

import { ipcMain } from 'electron';
import type { BrowserWindow } from 'electron';

import { AseService } from './ase.service';
import { AseIPC } from './ase.types';
import type { AseInfoResult, AsePowerResult, AseResult } from './ase.types';
import { logger } from '../logger';

let service: AseService | null = null;

export function registerAseIpc(win: BrowserWindow): void {
  logger.info('IPC', 'Registering ASE IPC handlers');

  service = new AseService(win);

  // ==================== CONNECT ====================
  ipcMain.handle(AseIPC.Connect, async (_, path: string): Promise<AseResult> => {
    try {
      await service?.connect(path);
      return { ok: true };
    } catch (err) {
      const error = err as Error;
      logger.error('ASE', 'Connect failed', { path }, err);
      return { error: error.message ?? 'Failed to connect' };
    }
  });

  // ==================== DISCONNECT ====================
  ipcMain.handle(AseIPC.Disconnect, async (): Promise<AseResult> => {
    try {
      await service?.disconnect();
      return { ok: true };
    } catch (err) {
      const error = err as Error;
      logger.error('ASE', 'Disconnect failed', {}, err);
      return { error: error.message ?? 'Failed to disconnect' };
    }
  });

  // ==================== GET INFO ====================
  ipcMain.handle(AseIPC.GetInfo, async (): Promise<AseInfoResult> => {
    try {
      const info = await service?.getInfo();
      return { ok: true, info };
    } catch (err) {
      const error = err as Error;
      logger.error('ASE', 'Get info failed', {}, err);
      return { error: error.message ?? 'Failed to read info' };
    }
  });

  // ==================== SET POWER ====================
  ipcMain.handle(AseIPC.SetPower, async (_, mW: number): Promise<AsePowerResult> => {
    try {
      const raw = await service?.setPower(mW);
      return { ok: true, raw };
    } catch (err) {
      const error = err as Error;
      logger.error('ASE', 'Set power failed', { mW }, err);
      return { error: error.message ?? 'Failed to set power' };
    }
  });

  // ==================== SET ENABLED ====================
  ipcMain.handle(AseIPC.SetEnabled, async (_, enabled: boolean): Promise<AseResult> => {
    try {
      await service?.setEnabled(enabled);
      return { ok: true };
    } catch (err) {
      const error = err as Error;
      logger.error('ASE', 'Set enabled failed', { enabled }, err);
      return { error: error.message ?? 'Failed to toggle emission' };
    }
  });

  // ==================== IS CONNECTED ====================
  ipcMain.handle(AseIPC.IsConnected, async (): Promise<boolean> => {
    return service?.isConnected() ?? false;
  });

  logger.info('IPC', 'ASE IPC handlers registered successfully');
}
