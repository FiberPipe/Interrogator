import { BrowserWindow, app, ipcMain, globalShortcut, dialog, } from "electron";
import { join } from "node:path";
import * as fs from "fs";
import * as path from "node:path";
import * as os from "node:os";
import { ApiService } from "./api";
import { startSensorCollector } from "./savetojson";
import { SerialPort } from "serialport";


const DEFAULT_INPUTS_PATH = path.join(
  os.homedir(),
  "Documents",
  "Interrogator",
  "inputs.json"
);

const DEFAULT_FILE_PATHS_PATH = path.join(
  os.homedir(),
  "Documents",
  "Interrogator",
  "file_paths.json"
);

async function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1080,
    height: 720,
    webPreferences: {
      preload: join(app.getAppPath(), "build/src/app/electron/bridge.js"),
    },
  });

  globalShortcut.register("F12", () => {
    mainWindow.webContents.toggleDevTools();
  });

  const env = process.env.NODE_ENV || "development";

  if (env === "production") {
    await mainWindow.loadFile("build/index.html");
  } else {
    await mainWindow.loadURL("http://localhost:3000/");
  }

  ipcMain.handle("selectFile", async () => {
    return new Promise((res) => {
      const k = dialog.showOpenDialogSync(mainWindow, {
        properties: ["openFile"],
      });

      const result = Array.isArray(k) ? k[0] : k;

      res(result);
    });
  });

  return mainWindow;
}

function readDataFile<T extends Record<string, string> | string>(
  path: string,
  defaultValue = {}
): T {
  if (fs.existsSync(path)) {
    const rawData = fs.readFileSync(path, "utf-8");

    return JSON.parse(rawData).slice(-200) as T;
  }

  return defaultValue as T;
}

function readDataFileInputs<T extends Record<string, string> | string>(
  path: string,
  defaultValue = {}
): T {
  if (fs.existsSync(path)) {
    const rawData = fs.readFileSync(path, "utf-8");

    try {
      return JSON.parse(rawData);
    } catch (err) {
      return rawData as T;
    }
  }

  return defaultValue as T;
}

function writeDataFile(filePath: string, data: Record<string, any>): void {
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

ipcMain.handle("getInputs", async (_e: unknown) => {
  return readDataFileInputs(DEFAULT_INPUTS_PATH, []);
});

ipcMain.handle("getSensorsData", async (_e: unknown, path: string) => {
  console.log({ path });
  return readDataFile(path, []);
});

ipcMain.handle(
  "insertInput",
  async (event: any, key: string, value: string) => {
    const data =
      readDataFileInputs<Record<string, string>>(DEFAULT_INPUTS_PATH);

    data[key] = value;

    writeDataFile(DEFAULT_INPUTS_PATH, data);
  }
);

ipcMain.handle("getFilePaths", async () => {
  return readDataFileInputs(DEFAULT_FILE_PATHS_PATH, {});
});

function readJSONFile<T>(filePath: string, defaultValue: T): T {
  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch {
      return defaultValue;
    }
  }
  return defaultValue;
}


ipcMain.handle("setFilePaths", async (_, filePaths) => {
  const currentPaths = readDataFileInputs<Record<string, string>>(DEFAULT_FILE_PATHS_PATH, {});
  const updatedPaths = { ...currentPaths, ...filePaths };
  writeDataFile(DEFAULT_FILE_PATHS_PATH, updatedPaths);
  return updatedPaths;
});

function waitForSensorDataPathAndStart() {
  let started = false;

  const interval = setInterval(() => {
    const filePaths = readJSONFile<Record<string, string>>(DEFAULT_FILE_PATHS_PATH, {});
    const inputs = readJSONFile<Record<string, string>>(DEFAULT_INPUTS_PATH, {});
    const sensorDataFilePath = filePaths["sensorDataFilePath"];
    const serialPortPath = filePaths["serialPortPath"] || "COM13"; 

    console.log(12345, filePaths, inputs)

    if (sensorDataFilePath && !started) {
      console.log("sensorDataFilePath найден:", sensorDataFilePath);
      console.log("serialPortPath найден:", serialPortPath);

      // передаём оба параметра
      startSensorCollector(sensorDataFilePath, serialPortPath, inputs);

      started = true;
      clearInterval(interval);
    }
  }, 1000);
}
app.whenReady().then(async () => {
  let window = await createWindow();

  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      window = await createWindow();
    }
  });

  const apiService = new ApiService(window);
  apiService.start();
  waitForSensorDataPathAndStart();
});


app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
