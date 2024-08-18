import { BrowserWindow, app, ipcMain, globalShortcut } from "electron";
import { join } from "node:path";
import { ApiService } from "./api";
import * as fs from "fs";

async function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1080,
    height: 720,
    webPreferences: {
      preload: join(app.getAppPath(), "build/src/app/electron/bridge.js"),
    },
  });

  globalShortcut.register('F12', () => {
    mainWindow.webContents.toggleDevTools();
  });


  const env = process.env.NODE_ENV || "development";

  if (env === "production") {
    await mainWindow.loadFile("build/index.html");
  } else {
    // todo: поправить чтение переменных окружения, прокинуть их в package.json и поправить здесь сборку
    await mainWindow.loadFile("build/index.html");
  }

  return mainWindow;
}

function readDataFile(path: string): Record<string, string> {
  if (fs.existsSync(path)) {
    const rawData = fs.readFileSync(path, "utf-8");

    return JSON.parse(rawData);
  }

  return {};
}

function readSensorsDataFile(path: string): Record<string, string> {
  if (fs.existsSync(path)) {
    const rawData = fs.readFileSync(path, "utf-8");

    return JSON.parse(rawData);
  }

  return {};
}


function writeDataFile(path: string, data: Record<string, string>): void {
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

ipcMain.handle("getInputs", async (_e: unknown, path: string) => {
  return readDataFile(path);
});

ipcMain.handle("getSensorData", async (_e: unknown, path: string) => {
  return readSensorsDataFile(path);
});

ipcMain.handle(
  "insertInput",
  async (event: any, key: string, value: string, path: string) => {
    const data = readDataFile(path);
    data[key] = value;

    console.log(app.getPath("userData"));
    writeDataFile(path, data);
  }
);

app.whenReady().then(async () => {
  let window = await createWindow();

  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      window = await createWindow();
    }
  });

  const apiService = new ApiService(window);
  apiService.start();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
