import { app } from 'electron';

import { createMainWindow } from './core/app/create-window';
import { initAppStorage } from './core/bootstrap/init-storage';
import { initAppDatabase } from './core/bootstrap/init-database';
import { cleanupApp } from './core/app/cleanup';
import { logEnvConfig } from './core/bootstrap/log-env';

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
