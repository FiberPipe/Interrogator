import type { BrowserWindow } from 'electron';

import { registerDatabaseIpc } from '../features/database/ipc/database.ipc';
import { registerSerialPortIpc } from '../features/serial';

export function registerAllIpc(win: BrowserWindow) {
  registerLogsIpc();
  registerDatabaseIpc();
  registerSerialPortIpc(win);
  registerIpc(win);
}
