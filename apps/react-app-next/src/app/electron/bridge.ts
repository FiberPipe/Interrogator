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