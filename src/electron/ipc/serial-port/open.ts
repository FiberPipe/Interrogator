import { ipcMain, BrowserWindow } from 'electron';
import { SerialPort } from 'serialport';
import { activePorts } from '../../state';

export function registerOpenPort(win: BrowserWindow) {
  ipcMain.handle('serial:open', async (_, path: string, baudRate = 115200) => {
    if (activePorts.has(path)) return { error: 'Port already open' };

    const port = new SerialPort({ path, baudRate });

    activePorts.set(path, port);

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
  });
}
