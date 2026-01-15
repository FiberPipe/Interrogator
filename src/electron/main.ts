import { app, BrowserWindow } from 'electron';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

import { registerIpc } from './ipc';
import { activePorts } from './state';
import { appStorage } from './storage/app-storage';
import { initDatabase } from './db/db';

let win: BrowserWindow | null = null;

console.log(
  'Preload path exists:',
  existsSync(join(__dirname, 'preload.js')),
  join(__dirname, 'preload.js'),
);

function initAppStorage() {
  const isFirstLaunch = appStorage.get<boolean>('isFirstLaunch');

  if (isFirstLaunch === undefined) {
    console.log('[Main] First app launch detected');

    appStorage.patch({
      isFirstLaunch: true,
      theme: 'system',
      language: 'ru',
      baudRate: 9600,
    });
  }
}

async function createWindow() {
  await initDatabase({
    location: 'appPath', // или 'userData', 'documents', 'custom'
    // customPath: '/path/to/custom/folder', // если location === 'custom'
  });
  
  win = new BrowserWindow({
    fullscreen: true,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  registerIpc(win);

  await win.loadURL('http://localhost:3000');

  win.webContents.openDevTools({ mode: 'right' });
}

app.whenReady().then(() => {
  initAppStorage();
  createWindow();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('before-quit', async () => {
  console.log('[Main] App quitting, closing all serial ports...');

  for (const [path, port] of activePorts.entries()) {
    try {
      console.log(`[Main] Closing port: ${path}`);
      port.close();
      activePorts.delete(path);
    } catch (err) {
      console.error(`[Main] Error closing port ${path}:`, err);
    }
  }
});

app.on('window-all-closed', () => {
  console.log('[Main] All windows closed');

  for (const [path, port] of activePorts.entries()) {
    try {
      console.log(`[Main] Closing port: ${path}`);
      port.close();
    } catch (err) {
      console.error(`[Main] Error closing port ${path}:`, err);
    }
  }

  activePorts.clear();

  if (process.platform !== 'darwin') {
    app.quit();
  }
});
