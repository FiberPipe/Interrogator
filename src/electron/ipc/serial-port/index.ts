import type { BrowserWindow } from 'electron';
import { registerClosePort } from './close';
import { registerOpenPort } from './open';
import { registerGetPorts } from './register';
import { autoConnectSerial } from './auto-connect';

export function registerSerialPortIpc(win: BrowserWindow): void {
  console.log('[Serial] Registering IPC handlers');
  
  registerGetPorts();
  registerOpenPort(win);
  registerClosePort();

  win.webContents.on('did-finish-load', () => {
    console.log('[Serial] Window loaded, attempting auto-connect');
    autoConnectSerial(win);
  });
}
