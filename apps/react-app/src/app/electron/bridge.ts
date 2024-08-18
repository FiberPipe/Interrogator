import { Listener } from "../types/global";

const { ipcRenderer, contextBridge } = require("electron");

const electron = {
  send: (channel: string, text: string) => {
    ipcRenderer.send(channel, text);
  },
  // todo: unsubscribe method
  subscribe: (channel: string, listener: Listener) => {
    ipcRenderer.on(channel, (_, value) => {
      listener(value);
    });
  },
  getInputs: (path: string): Promise<Record<string, string>> =>
    ipcRenderer.invoke("getInputs", path),
  getSensorsData: (path: string): Promise<Record<string, string>> =>
    ipcRenderer.invoke("getSensorsData", path),
  insertInput: (key: string, value: string, path: string): Promise<void> =>
    ipcRenderer.invoke("insertInput", key, value, path),
  selectFile: (): Promise<void> =>
      ipcRenderer.invoke("selectFile"),
};

contextBridge.exposeInMainWorld("electron", electron);
