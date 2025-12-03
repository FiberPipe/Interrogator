import { BrowserWindow } from 'electron';
import { registerSerialPortIpc } from './serial-port';
import { registerAppDataIpc } from './app-data';

export function registerIpc(win: BrowserWindow) {
  registerSerialPortIpc(win);
  registerAppDataIpc();
}
