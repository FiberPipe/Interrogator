import { ipcMain, app } from "electron";

export function registerRestartHandler() {
    ipcMain.on("restart-app", () => {
      app.relaunch();
      app.exit(0);
    });
  }