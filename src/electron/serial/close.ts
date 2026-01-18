import { ipcMain } from 'electron';
import type { SerialOpenResult } from './types';
import type { SerialPortManager } from './port-manager';

export function registerClosePort(manager: SerialPortManager): void {
  ipcMain.handle('serial:close', async (_, path: string): Promise<SerialOpenResult> => {
    try {
      console.log(`[Serial] Closing port ${path}`);

      if (!manager.isPortOpen(path)) {
        console.warn(`[Serial] Port ${path} is not open`);
        return { error: 'Port not opened' };
      }

      await manager.closePort(path);
      
      console.log(`[Serial] ✅ Port ${path} closed successfully`);
      return { ok: true };
    } catch (err) {
      console.error(`[Serial] ❌ Error closing port ${path}:`, err);
      return { error: String(err) };
    }
  });
}
