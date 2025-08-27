import { IpcRendererEvent } from "electron";
import { Listener } from "../types/global";

const { ipcRenderer, contextBridge } = require("electron");

interface ScriptOutputData {
  pid: number;
  output: string;
}

interface ScriptErrorData {
  pid: number;
  error: string;
}

interface ScriptExitData {
  pid: number;
  code: number;
}

interface RunScriptResult {
  pid: number;
}

interface ScriptStatus {
  isRunning: boolean;
  pid?: number;
}

type ScriptOutputCallback = (data: ScriptOutputData) => void;
type ScriptErrorCallback = (data: ScriptErrorData) => void;
type ScriptExitCallback = (data: ScriptExitData) => void;

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
  setFilePaths: (filePaths: string[]) => ipcRenderer.invoke('setFilePaths', filePaths),

  runPythonScript: (scriptPath: string = '', args = []) => ipcRenderer.invoke("run-python-script", scriptPath, args),

  getScriptStatus: (pid: number): Promise<ScriptStatus> =>
    ipcRenderer.invoke('getScriptStatus', pid),

  killScript: (pid: number): Promise<boolean> =>
    ipcRenderer.invoke('killScript', pid),

  // Подписка на события скриптов
  onScriptOutput: (callback: ScriptOutputCallback): void => {
    ipcRenderer.on('script-output', (event: IpcRendererEvent, data: ScriptOutputData) => callback(data));
  },

  onScriptError: (callback: ScriptErrorCallback): void => {
    ipcRenderer.on('script-error', (event: IpcRendererEvent, data: ScriptErrorData) => callback(data));
  },

  onScriptExit: (callback: ScriptExitCallback): void => {
    ipcRenderer.on('script-exit', (event: IpcRendererEvent, data: ScriptExitData) => callback(data));
  },

  checkPython: () => ipcRenderer.invoke('checkPython')

};

contextBridge.exposeInMainWorld("electron", electron);