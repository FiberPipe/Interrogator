"use strict";
const { ipcRenderer, contextBridge } = require("electron");
// -------------------- Serial API --------------------
contextBridge.exposeInMainWorld('serial', {
    getPorts: () => ipcRenderer.invoke('serial:getPorts'),
    open: (path, baud) => ipcRenderer.invoke('serial:open', path, baud),
    close: (path) => ipcRenderer.invoke('serial:close', path),
    onData: (cb) => {
        ipcRenderer.on('serial:data', (_event, data) => cb(data));
    },
    onClosed: (cb) => {
        ipcRenderer.on('serial:closed', (_event, port) => cb(port));
    },
});
// -------------------- AppData API --------------------
contextBridge.exposeInMainWorld('appData', {
    getAll: () => ipcRenderer.invoke('app-data:get-all'),
    set: (key, value) => ipcRenderer.invoke('app-data:set', key, value),
    delete: (key) => ipcRenderer.invoke('app-data:delete', key),
    patch: (patch) => ipcRenderer.invoke('app-data:patch', patch),
});
console.log('Preload loaded');
