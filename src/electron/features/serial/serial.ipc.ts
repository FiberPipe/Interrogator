// src/electron/features/serial/serial.ipc.ts

import { ipcMain } from 'electron';
import type { BrowserWindow } from 'electron';

import type { SerialOpenResult, ISerialPortManager } from './serial.types';
import { SerialIPC } from './serial.types';
import { createConnectionService } from './services/connection.service';
import { logger } from '../logger';
import { createError } from '../../../shared/errors';
import { ErrorCodes } from '../../../shared/errors/error-codes';

export function registerSerialIpc(win: BrowserWindow, manager: ISerialPortManager): void {
  logger.info('IPC', 'Registering serial IPC handlers');

  const connectionService = createConnectionService(win, manager);

  // ==================== GET PORTS ====================
  ipcMain.handle(SerialIPC.GetPorts, async () => {
    return logger.withLogging('IPC', 'Get ports', async () => {
      try {
        return await connectionService.getPorts();
      } catch (err) {
        throw createError({
          code: ErrorCodes.SERIAL_PORT_ERROR,
          title: 'Get Ports Failed',
          description: 'Failed to retrieve serial ports list',
          cause: err,
          area: 'Serial',
        });
      }
    });
  });

  // ==================== OPEN PORT ====================
  ipcMain.handle(
    SerialIPC.Open,
    async (_, path: string, baudRate?: number): Promise<SerialOpenResult> => {
      return logger.withLogging(
        'IPC',
        'Open port',
        async () => {
          try {
            await connectionService.openPort(path, baudRate);
            return { ok: true };
          } catch (err) {
            const error = err as Error;
            logger.error('IPC', 'Failed to open port', { path, baudRate }, err);
            return { error: error.message ?? 'Failed to open port' };
          }
        },
        { path, baudRate },
      );
    },
  );

  // ==================== CLOSE PORT ====================
  ipcMain.handle(SerialIPC.Close, async (_, path: string): Promise<SerialOpenResult> => {
    return logger.withLogging(
      'IPC',
      'Close port',
      async () => {
        try {
          await connectionService.closePort(path);
          return { ok: true };
        } catch (err) {
          const error = err as Error;
          logger.error('IPC', 'Failed to close port', { path }, err);
          return { error: error.message ?? 'Failed to close port' };
        }
      },
      { path },
    );
  });

  logger.info('IPC', 'Serial IPC handlers registered successfully');
}
