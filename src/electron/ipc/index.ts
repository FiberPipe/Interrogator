import type { BrowserWindow } from 'electron';

import { registerAppDataIpc } from './app-data';

export function registerIpc(_win: BrowserWindow): void {
  registerAppDataIpc();
}
