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
  getInputs: (): Promise<Record<string, string>> =>
    ipcRenderer.invoke("getInputs"),
  getSensorsData: (): Promise<Record<string, string>> =>
    ipcRenderer.invoke("getSensorsData"),
  insertInput: (key: string, value: string): Promise<void> =>
    ipcRenderer.invoke("insertInput", key, value),
};

contextBridge.exposeInMainWorld("electron", electron);
