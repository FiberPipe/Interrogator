const { ipcRenderer, contextBridge } = require("electron");

import { IpcRendererEvent } from "electron";
import { Listener } from "../types/global";
import { SensorData } from "./types";

interface InterrogatorApi {
  send: (channel: string, text: string) => void;
  getFilePaths: () => Promise<string[]>;
  setFilePaths: (filePaths: string[]) => Promise<void>;
  subscribe: (channel: string, listener: Listener) => (...args: any[]) => void;
  unsubscribe: (channel: string, listener: (...args: any[]) => void) => void;
  getUserSettings: () => Promise<any>;
  saveUserSettings: (settings: any) => Promise<void>;
  restartApp: () => void;
  getSensorsData: (path: string) => Promise<SensorData[]>;
  getInputs: () =>  Promise<Record<string, string>>;
  insertInput: (key: string, value: string, path: string) => Promise<void>;
}

const electron: InterrogatorApi = {
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
  getUserSettings: () => ipcRenderer.invoke("get-user-settings"),
  saveUserSettings: (settings: any) => ipcRenderer.invoke("save-user-settings", settings),
  restartApp: () => ipcRenderer.send("restart-app"),
  getSensorsData: (path: string): Promise<SensorData[]> =>
    ipcRenderer.invoke("getSensorsData", path),
  getInputs: (): Promise<Record<string, string>> =>
    ipcRenderer.invoke("getInputs"),
  insertInput: (key: string, value: string, path: string): Promise<void> =>
    ipcRenderer.invoke("insertInput", key, value, path),
};

// Экспорт API в глобальный контекст
contextBridge.exposeInMainWorld("electron", electron);

// Экспорт API логгера
contextBridge.exposeInMainWorld("logger", {
  info: (msg: string) => ipcRenderer.send("log-message", "info", msg),
  error: (msg: string) => ipcRenderer.send("log-message", "error", msg),
  warn: (msg: string) => ipcRenderer.send("log-message", "warn", msg),
  debug: (msg: string) => ipcRenderer.send("log-message", "debug", msg),
  getFiles: () => ipcRenderer.invoke("logs:getFiles"),
  readFile: (fileName: string) => ipcRenderer.invoke("logs:readFile", fileName),
});


export interface GrpcApi {
  listBdiModules: () => Promise<any[]>;
  listDrivers: () => Promise<any[]>;
  listTestSources: () => Promise<any[]>;
}

const grpc: GrpcApi = {
  listBdiModules: () => ipcRenderer.invoke("grpc:listBdiModules"),
  listDrivers: () => ipcRenderer.invoke("grpc:listDrivers"),
  listTestSources: () => ipcRenderer.invoke("grpc:listTestSources"),
};

contextBridge.exposeInMainWorld("grpc", grpc);