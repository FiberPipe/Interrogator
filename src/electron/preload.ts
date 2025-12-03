const { ipcRenderer, contextBridge } = require("electron");

// -------------------- Serial API --------------------
contextBridge.exposeInMainWorld('serial', {
  getPorts: (): Promise<any[]> => ipcRenderer.invoke('serial:getPorts'),
  open: (path: string, baud: number): Promise<void> => ipcRenderer.invoke('serial:open', path, baud),
  close: (path: string): Promise<void> => ipcRenderer.invoke('serial:close', path),
  onData: (cb: (data: unknown) => void): void => {
    ipcRenderer.on('serial:data', (_event: any, data: unknown) => cb(data));
  },
  onClosed: (cb: (port: string) => void): void => {
    ipcRenderer.on('serial:closed', (_event: any, port: string) => cb(port));
  },
});

// -------------------- AppData API --------------------
contextBridge.exposeInMainWorld('appData', {
  getAll: (): Promise<Record<string, unknown>> => ipcRenderer.invoke('app-data:get-all'),
  set: (key: string, value: unknown): Promise<void> => ipcRenderer.invoke('app-data:set', key, value),
  delete: (key: string): Promise<void> => ipcRenderer.invoke('app-data:delete', key),
  patch: (patch: Record<string, unknown>): Promise<void> => ipcRenderer.invoke('app-data:patch', patch),
});

console.log('Preload loaded');
