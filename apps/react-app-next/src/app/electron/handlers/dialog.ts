import { ipcMain, dialog, BrowserWindow } from "electron";
import log from "electron-log";

export function registerDialogHandlers(mainWindow: BrowserWindow) {
  ipcMain.handle("selectFile", async () => {
    const result = dialog.showOpenDialogSync(mainWindow, {
      properties: ["openFile"],
    });

    const file = Array.isArray(result) ? result[0] : result;

    if (file) {
      log.info(`📂 Пользователь выбрал файл: ${file}`);
    }

    return file;
  });
}
