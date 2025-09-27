import { ipcMain, BrowserWindow } from "electron";
import { writeJSONFile } from "../fs-utils";
import { ensureMeta, getDataFilePath } from "./shared";

export function registerPredictionIpc(mainWindow?: BrowserWindow) {
  ipcMain.handle("getPredictionMethods", async () => {
    const file = getDataFilePath();
    const arr = ensureMeta(file);
    return (arr[0].__meta?.predictionMethods || {}) as Record<string, any>;
  });

  ipcMain.handle("setPredictionMethod", async (_e, sensorIndex: number, method: "Analytical" | "ML") => {
    const file = getDataFilePath();
    const arr = ensureMeta(file);
    const meta = arr[0].__meta || {};
    const pm = { ...(meta.predictionMethods || {}) };
    pm[String(sensorIndex)] = method;
    arr[0].__meta = { ...meta, predictionMethods: pm };
    writeJSONFile(file, arr);

    BrowserWindow.getAllWindows().forEach((w) =>
      w.webContents.send("prediction-methods-updated", pm)
    );

    return pm;
  });
}
