import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("portPicker", {
  list: () => ipcRenderer.invoke("pp:list"),
  choose: (path: string) => ipcRenderer.invoke("pp:choose", path),
  cancel: () => ipcRenderer.invoke("pp:cancel"),
});
