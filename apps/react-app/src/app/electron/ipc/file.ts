import { ipcMain, BrowserWindow, dialog } from "electron";
import { readJSONFile, writeJSONFile } from "../fs-utils";
import * as fs from "fs";
import { DEFAULT_FILE_PATHS_PATH } from "../constants";

export function registerFileIpc(mainWindow: Electron.BrowserWindow) {
  ipcMain.handle("selectFile", async () => {
    const k = dialog.showOpenDialogSync(mainWindow, { properties: ["openFile"] });
    return Array.isArray(k) ? k[0] : k;
  });

  ipcMain.handle("getFilePaths", async () => readJSONFile(DEFAULT_FILE_PATHS_PATH, {}));

  ipcMain.handle("setFilePaths", async (_e, filePaths) => {
    const before = readJSONFile<Record<string, string>>(DEFAULT_FILE_PATHS_PATH, {});
    const updated = { ...before, ...filePaths };
    writeJSONFile(DEFAULT_FILE_PATHS_PATH, updated);

    if (updated.sensorDataFilePath && !fs.existsSync(updated.sensorDataFilePath)) {
      writeJSONFile(updated.sensorDataFilePath, []);
    }

    BrowserWindow.getAllWindows().forEach((w) => {
      w.webContents.send("file-paths-updated", updated);
    });

    if (before.sensorDataFilePath !== updated.sensorDataFilePath && updated.sensorDataFilePath) {
      BrowserWindow.getAllWindows().forEach((w) =>
        w.webContents.send("data-file-cleared", updated.sensorDataFilePath)
      );
    }

    return updated;
  });
}
