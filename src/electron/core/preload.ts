// src/electron/core/preload.ts

import { contextBridge } from 'electron';

import { logsAPI, sendLog } from '../features/logger';
import { appDataAPI } from '../features/app-data';
import { databaseAPI } from '../features/database';
import { serialAPI } from '../features/serial';
import { aseAPI } from '../features/ase';

/**
 * Expose APIs to renderer process
 */
contextBridge.exposeInMainWorld('electron', {
  logs: logsAPI,
  appData: appDataAPI,
  database: databaseAPI,
  serial: serialAPI,
  ase: aseAPI,
});

sendLog('INFO', 'Preload', 'Preload script loaded successfully');
sendLog(
  'INFO',
  'Preload',
  `APIs exposed: ${Object.keys({ logsAPI, appDataAPI, databaseAPI, serialAPI, aseAPI }).join(', ')}`,
);
