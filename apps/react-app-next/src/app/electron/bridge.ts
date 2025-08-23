const { ipcRenderer, contextBridge } = require("electron");

import { IpcRendererEvent } from "electron";
import { Listener } from "../types/global";

const electron = {
  send: (channel: string, text: string) => {
    ipcRenderer.send(channel, text);
  },
  getFilePaths: () => ipcRenderer.invoke('getFilePaths'),
  setFilePaths: (filePaths: string[]) => ipcRenderer.invoke('setFilePaths', filePaths),
  subscribe: (channel: string, listener: Listener) => {
    const wrappedListener = (_: IpcRendererEvent, value: string) => {
      listener(value);
    };
    ipcRenderer.on(channel, wrappedListener);
    return wrappedListener;
  },
  unsubscribe: (channel: string, listener: (...args: any[]) => void) => {
    ipcRenderer.removeListener(channel, listener);
  },
};

contextBridge.exposeInMainWorld("electron", electron);

contextBridge.exposeInMainWorld("logger", {
  info: (msg: string) => ipcRenderer.send("log-message", "info", msg),
  error: (msg: string) => ipcRenderer.send("log-message", "error", msg),
  warn: (msg: string) => ipcRenderer.send("log-message", "warn", msg),
  debug: (msg: string) => ipcRenderer.send("log-message", "debug", msg),
  getFiles: () => ipcRenderer.invoke("logs:getFiles"),
  readFile: (fileName: string) => ipcRenderer.invoke("logs:readFile", fileName),
});