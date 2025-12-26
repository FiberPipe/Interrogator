// src/main/serial/close.ts
import { ipcMain } from 'electron';
import type { SerialOpenResult } from './types';
import { activePorts } from '../../state';

export function registerClosePort(): void {
  ipcMain.handle('serial:close', (_, path: string): Promise<SerialOpenResult> => {
    return new Promise((resolve) => {
      try {
        console.log(`[Serial] Closing port ${path}`);
        
        const port = activePorts.get(path);
        
        if (!port) {
          console.warn(`[Serial] Port ${path} not found`);
          resolve({ error: 'Port not opened' });
          return;
        }

        port.close((err) => {
          if (err) {
            console.error(`[Serial] Error closing port ${path}:`, err);
            resolve({ error: err.message });
          } else {
            activePorts.delete(path);
            console.log(`[Serial] Port ${path} closed successfully`);
            resolve({ ok: true });
          }
        });
      } catch (err) {
        console.error(`[Serial] Error closing port ${path}:`, err);
        resolve({ error: String(err) });
      }
    });
  });
}
