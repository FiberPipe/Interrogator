import { app } from "electron";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { readJSONFile, writeJSONFile, DEFAULT_FILE_PATHS_PATH } from "./file-utils";
import { ApiService } from "./api/api.service";
import { createMainWindow } from "./window";

app.whenReady().then(async () => {
  const filePaths = readJSONFile<Record<string, string>>(DEFAULT_FILE_PATHS_PATH, {});
  const sensorDataFilePath =
    filePaths.sensorDataFilePath || path.join(os.homedir(), "Documents", "Interrogator", "data.json");

  const dir = path.dirname(sensorDataFilePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(sensorDataFilePath)) writeJSONFile(sensorDataFilePath, []);

  const mainWindow = await createMainWindow();

  const apiService = new ApiService(mainWindow);
  apiService.start();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
