import { BrowserWindow } from 'electron';
import { registerSerialPortIpc } from './serial-port';

export function registerIpc(win: BrowserWindow) {
  registerSerialPortIpc(win);
}
