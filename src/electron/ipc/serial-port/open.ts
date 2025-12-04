import type { BrowserWindow } from 'electron';
import { ipcMain } from 'electron';
import { SerialPort } from 'serialport';

import { activePorts } from '../../state';
import { appStorage } from '../../storage/app-storage';

export function registerOpenPort(win: BrowserWindow) {
  ipcMain.handle('serial:open', async (_, path: string, baudRate = 115200) => {
    try {
      if (activePorts.has(path)) {
        return { error: 'Port already open' };
      }

      const port = new SerialPort({ path, baudRate });

      activePorts.set(path, port);

      appStorage.set('lastPort', path);
      appStorage.set('baudRate', baudRate);

      port.on('data', (data) => {
        win.webContents.send('serial:data', {
          port: path,
          data: data.toString(),
        });
      });

      port.on('close', () => {
        activePorts.delete(path);
        win.webContents.send('serial:closed', path);
      });

      return { ok: true };
    } catch (err: any) {
      return { error: err.message || 'Failed to open port' };
    }
  });
}
