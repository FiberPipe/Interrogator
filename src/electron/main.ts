import { app, BrowserWindow } from 'electron';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

import { registerIpc } from './ipc';

let win: BrowserWindow | null = null;

console.log(
  'Preload path exists:',
  existsSync(join(__dirname, 'preload.js')),
  join(__dirname, 'preload.js'),
);

async function createWindow() {
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

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
