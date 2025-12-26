// src/preload/preload.ts
import { ipcRenderer, contextBridge, IpcRendererEvent } from 'electron';

// Типы
interface SerialPortInfo {
  path: string;
  manufacturer?: string;
  serialNumber?: string;
  vendorId?: string;
  productId?: string;
  busy: boolean;
}

interface SerialOpenResult {
  ok?: boolean;
  error?: string;
}

interface SerialDataEvent {
  port: string;
  data: string;
}

interface SerialAPI {
  getPorts(): Promise<SerialPortInfo[]>;
  open(path: string, baud: number): Promise<SerialOpenResult>;
  close(path: string): Promise<SerialOpenResult>;
  onData(cb: (data: SerialDataEvent) => void): () => void;
  onClosed(cb: (port: string) => void): () => void;
  onError(cb: (data: { port: string; error: string }) => void): () => void;
}

interface AppDataAPI {
  getAll(): Promise<Record<string, unknown>>;
  set(key: string, value: unknown): Promise<void>;
  delete(key: string): Promise<void>;
  patch(patch: Record<string, unknown>): Promise<void>;
}

// -------------------- Serial API --------------------
const serialAPI: SerialAPI = {
  getPorts: (): Promise<SerialPortInfo[]> => {
    console.log('[Preload] 📡 getPorts called');
    return ipcRenderer.invoke('serial:getPorts');
  },

  open: (path: string, baud: number): Promise<SerialOpenResult> => {
    console.log('[Preload] 🔌 open called:', { path, baud });
    return ipcRenderer.invoke('serial:open', path, baud)
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
    return ipcRenderer.invoke('serial:close', path)
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

contextBridge.exposeInMainWorld('serial', serialAPI);
contextBridge.exposeInMainWorld('appData', appDataAPI);

console.log('[Preload] ✅ Loaded successfully');
console.log('[Preload] window.serial:', !!serialAPI);
console.log('[Preload] window.appData:', !!appDataAPI);
