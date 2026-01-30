import { app } from 'electron';

import { createMainWindow } from './app/create-window';
import { initAppStorage } from './bootstrap/init-storage';
import { initAppDatabase } from './bootstrap/init-database';
import { cleanupApp } from './app/cleanup';
import { logEnvConfig } from './bootstrap/log-env';

logEnvConfig();

app.whenReady().then(async () => {
  initAppStorage();
  await initAppDatabase();
  await createMainWindow();
});

app.on('before-quit', async (e) => {
  e.preventDefault();
  await cleanupApp();
  app.exit(0);
});
