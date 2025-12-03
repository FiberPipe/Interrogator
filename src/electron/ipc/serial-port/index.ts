import { BrowserWindow } from 'electron';
import { registerClosePort } from './close';
import { registerOpenPort } from './open';
import { registerGetPorts } from './register';
import { autoConnectSerial } from './auto-connect';

export function registerSerialPortIpc(win: BrowserWindow) {
  registerGetPorts();
  registerOpenPort(win);
  registerClosePort();

  win.webContents.on('did-finish-load', () => {
    autoConnectSerial(win);
  });
}
