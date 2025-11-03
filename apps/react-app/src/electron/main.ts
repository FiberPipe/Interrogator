import { BrowserWindow, app, ipcMain, globalShortcut, dialog } from "electron";
import { join } from "node:path";
import * as fs from "fs";
import * as path from "node:path";
import * as os from "node:os";
import { ApiService } from "./api";
import { startSensorCollector } from "./savetojson";
import { SerialPort } from "serialport";

const DEFAULT_INPUTS_PATH = path.join(os.homedir(), "Documents", "Interrogator", "inputs.json");
const DEFAULT_FILE_PATHS_PATH = path.join(os.homedir(), "Documents", "Interrogator", "file_paths.json");

function readDataFile<T extends any>(file: string, def: any = []): T {
  try {
    if (!fs.existsSync(file)) return def as T;
    const raw = fs.readFileSync(file, "utf-8");
    if (!raw.trim()) return def as T;
    const parsed = JSON.parse(raw);
    return (Array.isArray(parsed) ? parsed.slice(-200) : def) as T;
  } catch {
    return def as T;
  }
}

function readJSONFile<T>(filePath: string, def: T): T {
  if (fs.existsSync(filePath)) {
    try { return JSON.parse(fs.readFileSync(filePath, "utf-8")); }
    catch { return def; }
  }
  return def;
}

function writeJSONFile(filePath: string, data: any): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

const getDataFilePath = () => {
  const fp = readJSONFile<Record<string, string>>(DEFAULT_FILE_PATHS_PATH, {});
  return fp.sensorDataFilePath || path.join(os.homedir(), "Documents", "Interrogator", "data.json");
};

const ensureMeta = (file: string) => {
  let arr: any[] = [];
  try { if (fs.existsSync(file)) arr = JSON.parse(fs.readFileSync(file, "utf-8")); } catch {}
  if (!Array.isArray(arr) || arr.length === 0 || !arr[0]?.__meta) {
    const defModel = path.join(path.dirname(file), "best_model_Exponential_04_05_25_run2.pkl");
    arr = [{ __meta: { predictionMethods: {}, mlModelPath: defModel } }];
    writeJSONFile(file, arr);
  }
  return arr;
};

async function setupPortPickerHandlers(mainWindow: BrowserWindow) {
  ipcMain.handle("pp:list", async () => {
    const list = await SerialPort.list();
    const score = (p: any) =>
      (/usb|^com\d+/i.test(p.path) ? 0 : /bluetooth/i.test(p.path) ? 2 : 1);
    return list.sort((a, b) => score(a) - score(b));
  });

  ipcMain.handle("pp:choose", async (_e, pathStr: string) => {
    // сохраняем выбранный порт
    const filePaths = readJSONFile<Record<string, string>>(DEFAULT_FILE_PATHS_PATH, {});
    const updatedPaths = { ...filePaths, serialPortPath: pathStr };
    writeJSONFile(DEFAULT_FILE_PATHS_PATH, updatedPaths);

    mainWindow.webContents.send("port-chosen", pathStr);
    return pathStr;
  });

  ipcMain.handle("pp:cancel", async () => {
    mainWindow.webContents.send("port-picker-cancelled");
    throw new Error("User cancelled port selection");
  });
}


async function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 1080,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const indexHtml = path.join(__dirname, "../renderer/index.html");
  // await mainWindow.loadFile(indexHtml);
  await mainWindow.loadURL("http://localhost:3000/");
  await setupPortPickerHandlers(mainWindow);

  ipcMain.handle("selectFile", async () => {
    return new Promise((res) => {
      const k = dialog.showOpenDialogSync(mainWindow, { properties: ["openFile"] });
      res(Array.isArray(k) ? k[0] : k);
    });
  });

  ipcMain.handle("getInputs", async () => readJSONFile(DEFAULT_INPUTS_PATH, {}));
  ipcMain.handle("getSensorsData", async (_e, p: string) => readDataFile(p, []));
  ipcMain.handle("insertInput", async (_e, key: string, value: string) => {
    const data = readJSONFile<Record<string, any>>(DEFAULT_INPUTS_PATH, {});
    data[key] = value;
    writeJSONFile(DEFAULT_INPUTS_PATH, data);
  });

  ipcMain.handle("getFilePaths", async () => readJSONFile(DEFAULT_FILE_PATHS_PATH, {}));

  // Сохранение путей/полей с уведомлением UI
  ipcMain.handle("setFilePaths", async (_e, filePaths) => {
    const before = readJSONFile<Record<string, string>>(DEFAULT_FILE_PATHS_PATH, {});
    const updated = { ...before, ...filePaths };
    writeJSONFile(DEFAULT_FILE_PATHS_PATH, updated);

    // гарантируем, что новый data.json существует
    if (updated.sensorDataFilePath && !fs.existsSync(updated.sensorDataFilePath)) {
      writeJSONFile(updated.sensorDataFilePath, []);
    }

    // // сообщаем всем окнам
    // BrowserWindow.getAllWindows().forEach((w) => {
    //   w.webContents.send("file-paths-updated", updated);
    // });

    // // если изменился файл данных — сбрасываем графики
    // if (before.sensorDataFilePath !== updated.sensorDataFilePath && updated.sensorDataFilePath) {
    //   BrowserWindow.getAllWindows().forEach((w) =>
    //     w.webContents.send("data-file-cleared", updated.sensorDataFilePath)
    //   );
    // }

    return updated;
  });

  // Методы выбора способа вычисления λ (Analytical/ML)
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

    // уведомим UI о смене метода 
    BrowserWindow.getAllWindows().forEach((w) =>
      w.webContents.send("prediction-methods-updated", pm)
    );

    return pm;
  });

  // Очистка JSON с немедленным сбросом графиков
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

  return mainWindow;
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

  let window = await createMainWindow();

  ipcMain.handle("start-collector", async (_e, chosenPort: string) => {
    const updatedPaths = { ...filePaths, serialPortPath: chosenPort, sensorDataFilePath };
    writeJSONFile(DEFAULT_FILE_PATHS_PATH, updatedPaths);
    await startSensorCollector(sensorDataFilePath, chosenPort, inputs);
    return true;
  });

  const apiService = new ApiService(window);
  apiService.start();
});


app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
