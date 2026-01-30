import { ipcMain } from 'electron';

import type { SerialOpenResult } from './types';
import type { SerialPortManager } from './port-manager';
import { logger } from '../logger/logger.utils';

export function registerClosePort(manager: SerialPortManager): void {
  ipcMain.handle('serial:close', async (_, path: string): Promise<SerialOpenResult> => {
    try {
      logger.info(`[Serial] Closing port ${path}`);

      if (!manager.isPortOpen(path)) {
        logger.warn(`[Serial] Port ${path} is not open`);
        return { error: 'Port not opened' };
      }

      await manager.closePort(path);

      logger.info(`[Serial] ✅ Port ${path} closed successfully`);
      return { ok: true };
    } catch (err) {
      logger.error(`[Serial] ❌ Error closing port ${path}:`, err);
      return { error: String(err) };
    }
  });
}
