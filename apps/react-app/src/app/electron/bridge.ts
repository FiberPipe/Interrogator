import { IpcRendererEvent } from "electron";
import { Listener } from "../types/global";

const { ipcRenderer, contextBridge } = require("electron");

const electron = {
  send: (channel: string, text: string) => {
    ipcRenderer.send(channel, text);
  },
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
  getInputs: (path: string): Promise<Record<string, string>> =>
    ipcRenderer.invoke("getInputs", path),
  getSensorsData: (path: string): Promise<Record<string, string>> =>
    ipcRenderer.invoke("getSensorsData", path),
  insertInput: (key: string, value: string, path: string): Promise<void> =>
    ipcRenderer.invoke("insertInput", key, value, path),
  selectFile: (): Promise<void> =>
    ipcRenderer.invoke("selectFile"),
  getFilePaths: () => ipcRenderer.invoke('getFilePaths'),
  setFilePaths: (filePaths: string[]) => ipcRenderer.invoke('setFilePaths', filePaths)
};

contextBridge.exposeInMainWorld("electron", electron);