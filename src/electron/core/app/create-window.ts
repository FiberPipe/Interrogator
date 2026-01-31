// src/electron/core/app/create-window.ts

import { BrowserWindow } from 'electron';
import { join } from 'node:path';

import { getAppUrl } from './get-app-url';
import { logger } from '../../features/logger';

export async function createMainWindow(): Promise<BrowserWindow> {
  return logger.withLogging('App', 'Create main window', async () => {
    const win = new BrowserWindow({
      width: 1400,
      height: 900,
      show: false,
      webPreferences: {
        preload: join(__dirname, '../preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
      },
    });

    registerAllIpc(win);

    await win.loadURL(getAppUrl());

    win.once('ready-to-show', () => {
      win.show();
      logger.info('App', 'Main window shown');
    });

    logger.info('App', 'Main window created successfully');

    return win;
  });
}
