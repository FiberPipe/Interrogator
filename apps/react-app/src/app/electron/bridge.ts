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
  runPythonScript: (args: string[] = []) => ipcRenderer.invoke("runPythonScript", args),
  listSerialPorts: (): Promise<
    {
      path: string;
      manufacturer?: string;
      serialNumber?: string;
      vendorId?: string;
      productId?: string;
    }[]
  > => ipcRenderer.invoke("listSerialPorts"),
   startSensorCollector: (filePath: any) => ipcRenderer.send("start-sensor-collector", filePath),
};

contextBridge.exposeInMainWorld("electron", electron);