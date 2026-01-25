import type { IpcRendererEvent } from 'electron';
import { ipcRenderer, contextBridge } from 'electron';

import type {
  SerialAPI,
  SerialPortInfo,
  SerialOpenResult,
  SerialDataEvent,
  AppDataAPI,
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

// -------------------- Serial API --------------------
const serialAPI: SerialAPI = {
  getPorts: (): Promise<SerialPortInfo[]> => {
    console.log('[Preload] 📡 getPorts called');
    return ipcRenderer.invoke('serial:getPorts');
  },

  open: (path: string, baud: number): Promise<SerialOpenResult> => {
    console.log('[Preload] 🔌 open called:', { path, baud });
    return ipcRenderer
      .invoke('serial:open', path, baud)
      .then((result: SerialOpenResult) => {
        console.log('[Preload] 📥 open result:', result);
        return result;
      })
      .catch((err: any) => {
        console.error('[Preload] ❌ open error:', err);
        return { error: String(err) };
      });
  },

  close: (path: string): Promise<SerialOpenResult> => {
    console.log('[Preload] 🔌 close called:', path);
    return ipcRenderer
      .invoke('serial:close', path)
      .then((result: SerialOpenResult) => {
        console.log('[Preload] 📥 close result:', result);
        return result;
      })
      .catch((err: any) => {
        console.error('[Preload] ❌ close error:', err);
        return { error: String(err) };
      });
  },

  onData: (cb: (data: SerialDataEvent) => void): (() => void) => {
    console.log('[Preload] 🎧 onData listener registered');

    const handler = (_event: IpcRendererEvent, data: SerialDataEvent) => {
      console.log('[Preload] 🟢 Data event received:', data);
      cb(data);
    };

    ipcRenderer.on('serial:data', handler);

    return () => {
      console.log('[Preload] 🧹 onData listener removed');
      ipcRenderer.removeListener('serial:data', handler);
    };
  },

  onClosed: (cb: (port: string) => void): (() => void) => {
    console.log('[Preload] 🎧 onClosed listener registered');

    const handler = (_event: IpcRendererEvent, port: string) => {
      console.log('[Preload] 🔴 Port closed event:', port);
      cb(port);
    };

    ipcRenderer.on('serial:closed', handler);

    return () => {
      console.log('[Preload] 🧹 onClosed listener removed');
      ipcRenderer.removeListener('serial:closed', handler);
    };
  },

  onError: (cb: (data: { port: string; error: string }) => void): (() => void) => {
    console.log('[Preload] 🎧 onError listener registered');

    const handler = (_event: IpcRendererEvent, data: { port: string; error: string }) => {
      console.error('[Preload] ❌ Error event:', data);
      cb(data);
    };

    ipcRenderer.on('serial:error', handler);

    return () => {
      console.log('[Preload] 🧹 onError listener removed');
      ipcRenderer.removeListener('serial:error', handler);
    };
  },
};

// -------------------- AppData API --------------------
const appDataAPI: AppDataAPI = {
  getAll: (): Promise<Record<string, unknown>> => {
    console.log('[Preload] 📦 getAll called');
    return ipcRenderer.invoke('app-data:get-all');
  },

  set: (key: string, value: unknown): Promise<void> => {
    console.log('[Preload] 💾 set called:', { key, value });
    return ipcRenderer.invoke('app-data:set', key, value);
  },

  delete: (key: string): Promise<void> => {
    console.log('[Preload] 🗑️ delete called:', key);
    return ipcRenderer.invoke('app-data:delete', key);
  },

  patch: (patch: Record<string, unknown>): Promise<void> => {
    console.log('[Preload] 🔧 patch called:', patch);
    return ipcRenderer.invoke('app-data:patch', patch);
  },
};

// -------------------- Database API --------------------
const databaseAPI: DatabaseAPI = {
  // Path and Config
  getPath: (): Promise<DatabasePathInfo> => {
    console.log('[Preload] 📁 getPath called');
    return ipcRenderer.invoke('db:getPath');
  },

  changeLocation: (
    location: DatabaseLocation,
    customPath?: string,
  ): Promise<DatabaseChangeLocationResult> => {
    console.log('[Preload] 📍 changeLocation called:', { location, customPath });
    return ipcRenderer.invoke('db:changeLocation', location, customPath);
  },

  selectCustomPath: (): Promise<string | null> => {
    console.log('[Preload] 📂 selectCustomPath called');
    return ipcRenderer.invoke('db:selectCustomPath');
  },

  openFolder: (): Promise<string> => {
    console.log('[Preload] 📁 openFolder called');
    return ipcRenderer.invoke('db:openFolder');
  },

  // Statistics
  getStats: (): Promise<DatabaseStats> => {
    console.log('[Preload] 📊 getStats called');
    return ipcRenderer.invoke('db:getStats');
  },

  getChannelStats: (
    port: string,
    channel: number,
    startTime: number,
    endTime: number,
  ): Promise<ChannelStats> => {
    console.log('[Preload] 📈 getChannelStats called:', { port, channel, startTime, endTime });
    return ipcRenderer.invoke('db:getChannelStats', port, channel, startTime, endTime);
  },

  // Data Queries
  getDataByTimeRange: (
    port: string,
    startTime: number,
    endTime: number,
    limit?: number,
  ): Promise<SensorDataRecord[]> => {
    console.log('[Preload] 🔍 getDataByTimeRange called:', { port, startTime, endTime, limit });
    return ipcRenderer.invoke('db:getDataByTimeRange', port, startTime, endTime, limit);
  },

  getLastRecords: (port: string, limit?: number): Promise<SensorDataRecord[]> => {
    console.log('[Preload] 📋 getLastRecords called:', { port, limit });
    return ipcRenderer.invoke('db:getLastRecords', port, limit);
  },

  // Backup and Restore
  createBackup: (): Promise<DatabaseBackupResult> => {
    console.log('[Preload] 💾 createBackup called');
    return ipcRenderer.invoke('db:createBackup');
  },

  restoreBackup: (): Promise<DatabaseBackupResult> => {
    console.log('[Preload] 📥 restoreBackup called');
    return ipcRenderer.invoke('db:restoreBackup');
  },

  // Export
  exportData: (options: DatabaseExportOptions): Promise<DatabaseExportResult> => {
    console.log('[Preload] 📤 exportData called:', options);
    return ipcRenderer.invoke('db:exportData', options);
  },

  // Maintenance
  vacuum: (): Promise<{ success: boolean; error?: string }> => {
    console.log('[Preload] 🧹 vacuum called');
    return ipcRenderer.invoke('db:vacuum');
  },

  clear: (): Promise<{ success: boolean; error?: string }> => {
    console.log('[Preload] 🗑️ clear called');
    return ipcRenderer.invoke('db:clear');
  },
};

// -------------------- Expose to Window --------------------
contextBridge.exposeInMainWorld('serial', serialAPI);
contextBridge.exposeInMainWorld('appData', appDataAPI);
contextBridge.exposeInMainWorld('database', databaseAPI);

console.log('[Preload] ✅ Loaded successfully');
console.log('[Preload] window.serial:', !!serialAPI);
console.log('[Preload] window.appData:', !!appDataAPI);
console.log('[Preload] window.database:', !!databaseAPI);
