import type { IpcRendererEvent } from "electron";
import type { FilePaths } from "../types/global";

const { ipcRenderer, contextBridge } = require("electron");
type Method = "Analytical" | "ML";
const on = <T = any>(channel: string, cb: (payload: T) => void) => {
  const handler = (_: IpcRendererEvent, payload: T) => cb(payload);
  ipcRenderer.on(channel, handler);
  return () => ipcRenderer.removeListener(channel, handler);
};

const electron = {
  send: (channel: string, ...args: any[]) => ipcRenderer.send(channel, ...args),

  subscribe: (channel: string, listener: (value: any) => void) => {
    const wrapped = (_: IpcRendererEvent, value: any) => listener(value);
    ipcRenderer.on(channel, wrapped);
    return wrapped as (...args: any[]) => void;
  },
  unsubscribe: (channel: string, listener: (...args: any[]) => void) => {
    ipcRenderer.removeListener(channel, listener);
  },

  getInputs: (): Promise<Record<string, string>> => ipcRenderer.invoke("getInputs"),

  getSensorsData: (path: string): Promise<any[]> =>
    ipcRenderer.invoke("getSensorsData", path),

  insertInput: (key: string, value: string): Promise<void> =>
    ipcRenderer.invoke("insertInput", key, value),

  selectFile: (): Promise<string | undefined> => ipcRenderer.invoke("selectFile"),

  getFilePaths: (): Promise<FilePaths> => ipcRenderer.invoke("getFilePaths"),
  setFilePaths: (filePaths: FilePaths): Promise<FilePaths> =>
    ipcRenderer.invoke("setFilePaths", filePaths),

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

  startSensorCollector: (filePath: string) =>
    ipcRenderer.send("start-sensor-collector", filePath),

  // Методы выбора способа вычисления λ
  getPredictionMethods: (): Promise<Record<string, Method>> =>
    ipcRenderer.invoke("getPredictionMethods"),
  setPredictionMethod: (sensorIndex: number, method: Method): Promise<Record<string, Method>> =>
    ipcRenderer.invoke("setPredictionMethod", sensorIndex, method),

  // Очистка JSON в main с немедленным уведомлением UI
  clearJson: (filePath?: string): Promise<boolean> =>
    ipcRenderer.invoke("clear-json", filePath),

  onFilePathsUpdated: (cb: (paths: FilePaths) => void) => on("file-paths-updated", cb),
  onDataFileCleared: (cb: (path: string) => void) => on("data-file-cleared", cb),
  onPredictionMethodsUpdated: (
    cb: (pm: Record<string, Method>) => void
  ) => on("prediction-methods-updated", cb),
};

contextBridge.exposeInMainWorld("electron", electron);
