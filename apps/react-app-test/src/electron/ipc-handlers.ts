import { ipcMain, dialog, BrowserWindow } from "electron";
import { readJSONFile, writeJSONFile, readDataFile, DEFAULT_INPUTS_PATH, DEFAULT_FILE_PATHS_PATH } from "./file-utils";
import { clearDataFile, handlePredictionMethods, handleSetPredictionMethod } from "./data-handlers";
import { startSensorCollector } from "./savetojson";

export async function setupIpcHandlers(mainWindow: BrowserWindow) {
  ipcMain.handle("selectFile", async () => {
    const res = dialog.showOpenDialogSync(mainWindow, { properties: ["openFile"] });
    return Array.isArray(res) ? res[0] : res;
  });

  ipcMain.handle("getInputs", async () => readJSONFile(DEFAULT_INPUTS_PATH, {}));

  ipcMain.handle("getSensorsData", async (_e, p: string) => readDataFile(p, []));

  ipcMain.handle("insertInput", async (_e, key: string, value: string) => {
    const data = readJSONFile<Record<string, any>>(DEFAULT_INPUTS_PATH, {});
    data[key] = value;
    writeJSONFile(DEFAULT_INPUTS_PATH, data);
  });

  ipcMain.handle("getFilePaths", async () => readJSONFile(DEFAULT_FILE_PATHS_PATH, {}));

  ipcMain.handle("setFilePaths", async (_e, filePaths) => {
    const before = readJSONFile<Record<string, string>>(DEFAULT_FILE_PATHS_PATH, {});
    const updated = { ...before, ...filePaths };
    writeJSONFile(DEFAULT_FILE_PATHS_PATH, updated);
    return updated;
  });

  ipcMain.handle("getPredictionMethods", handlePredictionMethods);

  ipcMain.handle("setPredictionMethod", async (_e, sensorIndex: number, method: "Analytical" | "ML") => {
    const pm = await handleSetPredictionMethod(sensorIndex, method);
    BrowserWindow.getAllWindows().forEach((w) =>
      w.webContents.send("prediction-methods-updated", pm)
    );
    return pm;
  });

  ipcMain.handle("clear-json", async (_e, providedPath?: string) =>
    clearDataFile(mainWindow, providedPath)
  );

  ipcMain.handle("start-collector", async (_e, chosenPort: string) => {
    const filePaths = readJSONFile<Record<string, string>>(DEFAULT_FILE_PATHS_PATH, {});
    const inputs = readJSONFile<Record<string, any>>(DEFAULT_INPUTS_PATH, {});
    const sensorDataFilePath = filePaths.sensorDataFilePath!;
    await startSensorCollector(sensorDataFilePath, chosenPort, inputs);
    return true;
  });
}
