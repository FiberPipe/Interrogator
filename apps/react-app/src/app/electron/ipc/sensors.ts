import { ipcMain, BrowserWindow } from "electron";
import * as fs from "fs";
import { readDataFile, writeJSONFile } from "../fs-utils";
import { getDataFilePath } from "./shared";

export function registerSensorsIpc(mainWindow?: BrowserWindow) {
  ipcMain.handle("getSensorsData", async (_e, p: string) => readDataFile(p, []));

  ipcMain.handle("clear-json", async (_e, providedPath?: string) => {
    try {
      let filePath = providedPath || getDataFilePath();

      if (!fs.existsSync(filePath)) writeJSONFile(filePath, []);
      else {
        let arr: any[] = [];
        try { arr = JSON.parse(fs.readFileSync(filePath, "utf-8")); } catch { arr = []; }
        const keepMeta = Array.isArray(arr) && arr[0] && arr[0].__meta ? [arr[0]] : [];
        writeJSONFile(filePath, keepMeta);
      }

      BrowserWindow.getAllWindows().forEach((w) =>
        w.webContents.send("data-file-cleared", filePath)
      );
      return true;
    } catch (e) {
      console.error("clear-json error:", e);
      return false;
    }
  });
}
