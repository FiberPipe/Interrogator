import { app, BrowserWindow } from "electron";
import { join } from "node:path";
import { registerIpcHandlers } from "./ipc";
import { readJSONFile, writeJSONFile } from "./fs-utils";
import { DEFAULT_FILE_PATHS_PATH, DEFAULT_INPUTS_PATH } from "./constants";
import * as path from "node:path";
import * as fs from "fs";
import * as os from "node:os";
import { startSensorCollector } from "./savetojson";
import { ApiService } from "./api";

async function createMainWindow() {
  const win = new BrowserWindow({
    width: 1080,
    height: 720,
    webPreferences: {
      preload: join(app.getAppPath(), "build/src/app/electron/bridge.js"),
    },
  });

  const env = process.env.NODE_ENV || "development";
  if (env === "production") await win.loadFile("build/index.html");
  else await win.loadURL("http://localhost:3000/");

  registerIpcHandlers(win);
  return win;
}

app.whenReady().then(async () => {
  const filePaths = readJSONFile<Record<string, string>>(DEFAULT_FILE_PATHS_PATH, {});
  const inputs = readJSONFile<Record<string, any>>(DEFAULT_INPUTS_PATH, {});
  const sensorDataFilePath =
    filePaths.sensorDataFilePath || path.join(os.homedir(), "Documents", "Interrogator", "data.json");

  try {
    const dir = path.dirname(sensorDataFilePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(sensorDataFilePath)) writeJSONFile(sensorDataFilePath, []);
  } catch (e) {
    console.error("Не удалось подготовить data.json:", e);
  }

  let chosenPort: string;
  // try { chosenPort = await pickSerialPortWithWindow(); }
  // catch (e) { console.error("Выбор порта отменён:", e); app.quit(); return; }

  const updatedPaths = { ...filePaths, sensorDataFilePath };
  writeJSONFile(DEFAULT_FILE_PATHS_PATH, updatedPaths);

  await startSensorCollector(sensorDataFilePath, "COM13", inputs);

  let window = await createMainWindow();

  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      window = await createMainWindow();
    }
  });

  const apiService = new ApiService(window);
  apiService.start();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
