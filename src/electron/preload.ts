import { contextBridge, ipcRenderer } from "electron";
import { SerialChannels } from "./ipc/serial-port/types";

contextBridge.exposeInMainWorld("serial", {
  getPorts: () => ipcRenderer.invoke(SerialChannels.GetPorts),
  open: (path: string, baud: number) =>
    ipcRenderer.invoke(SerialChannels.Open, path, baud),
  close: (path: string) =>
    ipcRenderer.invoke(SerialChannels.Close, path),

  onData: (cb: (data: unknown) => void) =>
    ipcRenderer.on(SerialChannels.Data, (_, d) => cb(d)),

  onClosed: (cb: (port: string) => void) =>
    ipcRenderer.on(SerialChannels.Closed, (_, p) => cb(p)),
});