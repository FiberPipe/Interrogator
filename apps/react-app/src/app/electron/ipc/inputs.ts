import { ipcMain } from "electron";
import { readJSONFile, writeJSONFile } from "../fs-utils";
import { DEFAULT_INPUTS_PATH } from "../constants";

export function registerInputsIpc(mainWindow?: Electron.CrossProcessExports.BrowserWindow) {
  ipcMain.handle("getInputs", async () => readJSONFile(DEFAULT_INPUTS_PATH, {}));

  ipcMain.handle("insertInput", async (_e, key: string, value: string) => {
    const data = readJSONFile<Record<string, any>>(DEFAULT_INPUTS_PATH, {});
    data[key] = value;
    writeJSONFile(DEFAULT_INPUTS_PATH, data);
  });
}
