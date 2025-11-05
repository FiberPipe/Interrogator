import { ipcMain, BrowserWindow } from "electron";
import { SerialPort } from "serialport";
import { readJSONFile, writeJSONFile, DEFAULT_FILE_PATHS_PATH } from "./file-utils";

export async function setupPortPickerHandlers(mainWindow: BrowserWindow) {
  ipcMain.handle("pp:list", async () => {
    const list = await SerialPort.list();
    const score = (p: any) =>
      /usb|^com\d+/i.test(p.path) ? 0 : /bluetooth/i.test(p.path) ? 2 : 1;
    return list.sort((a, b) => score(a) - score(b));
  });

  ipcMain.handle("pp:choose", async (_e, pathStr: string) => {
    const filePaths = readJSONFile<Record<string, string>>(DEFAULT_FILE_PATHS_PATH, {});
    const updated = { ...filePaths, serialPortPath: pathStr };
    writeJSONFile(DEFAULT_FILE_PATHS_PATH, updated);

    mainWindow.webContents.send("port-chosen", pathStr);
    return pathStr;
  });

  ipcMain.handle("pp:cancel", async () => {
    mainWindow.webContents.send("port-picker-cancelled");
    throw new Error("User cancelled port selection");
  });
}
