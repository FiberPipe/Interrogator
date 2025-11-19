"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const types_1 = require("./ipc/serial-port/types");
electron_1.contextBridge.exposeInMainWorld("serial", {
    getPorts: () => electron_1.ipcRenderer.invoke(types_1.SerialChannels.GetPorts),
    open: (path, baud) => electron_1.ipcRenderer.invoke(types_1.SerialChannels.Open, path, baud),
    close: (path) => electron_1.ipcRenderer.invoke(types_1.SerialChannels.Close, path),
    onData: (cb) => electron_1.ipcRenderer.on(types_1.SerialChannels.Data, (_, d) => cb(d)),
    onClosed: (cb) => electron_1.ipcRenderer.on(types_1.SerialChannels.Closed, (_, p) => cb(p)),
});
