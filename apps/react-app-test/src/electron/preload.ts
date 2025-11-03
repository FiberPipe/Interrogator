import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("api", {
  ping: () => console.log("pong from preload"),
});
