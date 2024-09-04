import { BrowserWindow, app, ipcMain, globalShortcut, dialog } from "electron";
import { join } from "node:path";
import { ApiService } from "./api";
import * as fs from "fs";
import * as path from "node:path";
import * as os from "node:os";

const DEFAULT_INPUTS_PATH = path.join(os.homedir(), 'Documents', 'Interrogator', 'inputs.json');

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
    // await mainWindow.loadFile("build/index.html");
    await mainWindow.loadURL("http://localhost:3000/");
  }

  ipcMain.handle("selectFile", async () => {
    return new Promise((res)=>{
      const k = dialog.showOpenDialogSync(mainWindow, {
        properties: ['openFile']
      });

      const result = Array.isArray(k) ? k[0] : k;

      res(result)
    })
  });

  return mainWindow;
}

function readDataFile<T extends Record<string, string> | string>(path: string, defaultValue = {}): T {
  if (fs.existsSync(path)) {
    const rawData = fs.readFileSync(path, "utf-8");

    try{
      return JSON.parse(rawData);
    } catch(err){
      return rawData as T
    }
  }

  return defaultValue as T;
}

function writeDataFile(filePath: string, data: Record<string, string>): void {
  if(!fs.existsSync(filePath)) {
    fs.mkdirSync(path.dirname(filePath), {recursive: true});
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

ipcMain.handle("getInputs", async (_e: unknown) => {
  return readDataFile(DEFAULT_INPUTS_PATH, []);
});

ipcMain.handle("getSensorsData", async (_e: unknown, path: string) => {
  console.log({path})
  return readDataFile(path, []);
});

ipcMain.handle(
  "insertInput",
  async (event: any, key: string, value: string) => {
    const data = readDataFile<Record<string, string>>(DEFAULT_INPUTS_PATH);
    data[key] = value;

    console.log(app.getPath("userData"));
    writeDataFile(DEFAULT_INPUTS_PATH, data);
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
