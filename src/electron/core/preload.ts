// src/preload.ts
/* eslint-disable no-console */
import type { IpcRendererEvent } from 'electron';
import { ipcRenderer, contextBridge } from 'electron';

import type {
  SerialAPI,
  SerialPortInfo,
  SerialOpenResult,
  SerialDataEvent,
  DatabaseAPI,
  DatabasePathInfo,
  DatabaseLocation,
  DatabaseChangeLocationResult,
  DatabaseStats,
  ChannelStats,
  SensorDataRecord,
  DatabaseBackupResult,
  DatabaseExportOptions,
  DatabaseExportResult,
} from './types';
import { logsAPI } from '../features/logger';

const log = {
  info: (msg: string) => ipcRenderer.send('log-info', `[Preload] ${msg}`),
  warn: (msg: string) => ipcRenderer.send('log-warn', `[Preload] ${msg}`),
  error: (msg: string) => ipcRenderer.send('log-error', `[Preload] ${msg}`),
  debug: (msg: string) => ipcRenderer.send('log-debug', `[Preload] ${msg}`),
};

// Переопределяем console в preload
console.log = log.info as any;
console.warn = log.warn as any;
console.error = log.error as any;
console.debug = log.debug as any;

/**
 * --------------------
 * Serial API
 * --------------------
 */
const serialAPI: SerialAPI = {
  getPorts: (): Promise<SerialPortInfo[]> => {
    log.info('📡 getPorts called');
    return ipcRenderer.invoke('serial:getPorts');
  },

  open: (path: string, baud: number): Promise<SerialOpenResult> => {
    log.info(`🔌 open called: ${path}, baud: ${baud}`);
    return ipcRenderer
      .invoke('serial:open', path, baud)
      .then((result: SerialOpenResult) => {
        log.info(`📥 open result: ${JSON.stringify(result)}`);
        return result;
      })
      .catch((err: any) => {
        log.error(`❌ open error: ${err instanceof Error ? err.stack : String(err)}`);
        return { error: String(err) };
      });
  },

  close: (path: string): Promise<SerialOpenResult> => {
    log.info(`🔌 close called: ${path}`);
    return ipcRenderer
      .invoke('serial:close', path)
      .then((result: SerialOpenResult) => {
        log.info(`📥 close result: ${JSON.stringify(result)}`);
        return result;
      })
      .catch((err: any) => {
        log.error(`❌ close error: ${err instanceof Error ? err.stack : String(err)}`);
        return { error: String(err) };
      });
  },

  onData: (cb: (data: SerialDataEvent) => void): (() => void) => {
    log.info('🎧 onData listener registered');

    const handler = (_event: IpcRendererEvent, data: SerialDataEvent) => {
      log.info(`🟢 Data event received: ${JSON.stringify(data)}`);
      cb(data);
    };

    ipcRenderer.on('serial:data', handler);

    return () => {
      log.info('🧹 onData listener removed');
      ipcRenderer.removeListener('serial:data', handler);
    };
  },

  onClosed: (cb: (port: string) => void): (() => void) => {
    log.info('🎧 onClosed listener registered');

    const handler = (_event: IpcRendererEvent, port: string) => {
      log.info(`🔴 Port closed event: ${port}`);
      cb(port);
    };

    ipcRenderer.on('serial:closed', handler);

    return () => {
      log.info('🧹 onClosed listener removed');
      ipcRenderer.removeListener('serial:closed', handler);
    };
  },

  onError: (cb: (data: { port: string; error: string }) => void): (() => void) => {
    log.info('🎧 onError listener registered');

    const handler = (_event: IpcRendererEvent, data: { port: string; error: string }) => {
      log.error(`❌ Error event: ${JSON.stringify(data)}`);
      cb(data);
    };

    ipcRenderer.on('serial:error', handler);

    return () => {
      log.info('🧹 onError listener removed');
      ipcRenderer.removeListener('serial:error', handler);
    };
  },
};

/**
 * --------------------
 * Database API
 * --------------------
 */
const databaseAPI: DatabaseAPI = {
  getPath: (): Promise<DatabasePathInfo> => {
    log.info('📁 getPath called');
    return ipcRenderer.invoke('db:getPath');
  },

  changeLocation: (
    location: DatabaseLocation,
    customPath?: string,
  ): Promise<DatabaseChangeLocationResult> => {
    log.info(`📍 changeLocation called: location=${location}, customPath=${customPath}`);
    return ipcRenderer.invoke('db:changeLocation', location, customPath);
  },

  selectCustomPath: (): Promise<string | null> => {
    log.info('📂 selectCustomPath called');
    return ipcRenderer.invoke('db:selectCustomPath');
  },

  openFolder: (): Promise<string> => {
    log.info('📁 openFolder called');
    return ipcRenderer.invoke('db:openFolder');
  },

  getStats: (): Promise<DatabaseStats> => {
    log.info('📊 getStats called');
    return ipcRenderer.invoke('db:getStats');
  },

  getChannelStats: (
    port: string,
    channel: number,
    startTime: number,
    endTime: number,
  ): Promise<ChannelStats> => {
    log.info(
      `📈 getChannelStats called: port=${port}, channel=${channel}, start=${startTime}, end=${endTime}`,
    );
    return ipcRenderer.invoke('db:getChannelStats', port, channel, startTime, endTime);
  },

  getDataByTimeRange: (
    port: string,
    startTime: number,
    endTime: number,
    limit?: number,
  ): Promise<SensorDataRecord[]> => {
    log.info(
      `🔍 getDataByTimeRange called: port=${port}, start=${startTime}, end=${endTime}, limit=${limit}`,
    );
    return ipcRenderer.invoke('db:getDataByTimeRange', port, startTime, endTime, limit);
  },

  getLastRecords: (port: string, limit?: number): Promise<SensorDataRecord[]> => {
    log.info(`📋 getLastRecords called: port=${port}, limit=${limit}`);
    return ipcRenderer.invoke('db:getLastRecords', port, limit);
  },

  createBackup: (): Promise<DatabaseBackupResult> => {
    log.info('💾 createBackup called');
    return ipcRenderer.invoke('db:createBackup');
  },

  restoreBackup: (): Promise<DatabaseBackupResult> => {
    log.info('📥 restoreBackup called');
    return ipcRenderer.invoke('db:restoreBackup');
  },

  exportData: (options: DatabaseExportOptions): Promise<DatabaseExportResult> => {
    log.info(`📤 exportData called: ${JSON.stringify(options)}`);
    return ipcRenderer.invoke('db:exportData', options);
  },

  vacuum: (): Promise<{ success: boolean; error?: string }> => {
    log.info('🧹 vacuum called');
    return ipcRenderer.invoke('db:vacuum');
  },

  clear: (): Promise<{ success: boolean; error?: string }> => {
    log.info('🗑️ clear called');
    return ipcRenderer.invoke('db:clear');
  },
};

contextBridge.exposeInMainWorld('serial', serialAPI);
contextBridge.exposeInMainWorld('appData', appDataAPI);
contextBridge.exposeInMainWorld('database', databaseAPI);
contextBridge.exposeInMainWorld('logs', logsAPI);

log.info('✅ Preload loaded successfully');
log.info(`window.serial: ${!!serialAPI}`);
log.info(`window.appData: ${!!appDataAPI}`);
log.info(`window.database: ${!!databaseAPI}`);
log.info(`window.logs: ${!!logsAPI}`);
