import { ipcMain } from 'electron';
import { activePorts } from '../../state';

export function registerClosePort() {
  ipcMain.handle('serial:close', (_, path: string) => {
    const port = activePorts.get(path);
    if (!port) return { error: 'Not opened' };

    port.close();
    activePorts.delete(path);

    return { ok: true };
  });
}
