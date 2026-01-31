// src/electron/core/preload.ts

import { contextBridge } from 'electron';

import { logsAPI } from '../features/logger';
import { appDataAPI } from '../features/app-data';
import { databaseAPI } from '../features/database';
import { serialAPI } from '../features/serial';

const log = {
  info: (msg: string) => logsAPI.send('INFO', 'Preload', msg),
  warn: (msg: string) => logsAPI.send('WARN', 'Preload', msg),
  error: (msg: string) => logsAPI.send('ERROR', 'Preload', msg),
  debug: (msg: string) => logsAPI.send('DEBUG', 'Preload', msg),
};

// Переопределяем console
console.log = log.info as any;
console.warn = log.warn as any;
console.error = log.error as any;
console.debug = log.debug as any;

/**
 * Expose APIs to window
 */
contextBridge.exposeInMainWorld('logs', logsAPI);
contextBridge.exposeInMainWorld('appData', appDataAPI);
contextBridge.exposeInMainWorld('database', databaseAPI);
contextBridge.exposeInMainWorld('serial', serialAPI);

log.info('Preload loaded successfully');
log.debug(`APIs exposed: logs=${!!logsAPI}, appData=${!!appDataAPI}, database=${!!databaseAPI}`);
