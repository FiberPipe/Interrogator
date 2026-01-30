import { BrowserWindow } from 'electron';
import { join } from 'node:path';

import { getAppUrl } from './get-app-url';
import { registerAllIpc } from '../register-ipc';

export async function createMainWindow(): Promise<BrowserWindow> {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload.js'),
      contextIsolation: true,
    },
  });

  registerAllIpc(win);

  await win.loadURL(getAppUrl());

  win.once('ready-to-show', () => win.show());

  return win;
}
