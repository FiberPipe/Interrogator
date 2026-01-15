import type { BrowserWindow } from 'electron';

import { registerSerialPortIpc } from './serial-port';
import { registerAppDataIpc } from './app-data';
import { registerDatabaseIpc } from './database';

export function registerIpc(win: BrowserWindow) {
  registerSerialPortIpc(win);
  registerAppDataIpc();
  registerDatabaseIpc();
}
