import { BrowserWindow, app, ipcMain } from "electron";
import { join } from "node:path";
import { ApiService } from "./api";
import * as fs from "fs";

const dataFilePath = join(__dirname, "inputData.json");

async function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1080,
    height: 720,
    webPreferences: {
      preload: join(app.getAppPath(), "build/src/app/electron/bridge.js"),
    },
  });

  const env = process.env.NODE_ENV || "development";

  if (env === "production") {
    await mainWindow.loadFile("build/index.html");
  } else {
    await mainWindow.loadURL("http://localhost:3000/");
  }

  return mainWindow;
}

function readDataFile(): Record<string, string> {
  if (fs.existsSync(dataFilePath)) {
    const rawData = fs.readFileSync(dataFilePath, "utf-8");

    console.log(rawData);
    return JSON.parse(rawData);
  }
  return {};
}

function writeDataFile(data: Record<string, string>): void {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

ipcMain.handle("getInputs", async () => {
  return readDataFile();
});

ipcMain.handle(
  "insertInput",
  async (event: any, key: string, value: string) => {
    const data = readDataFile();
    data[key] = value;

    console.log(app.getPath("userData"));
    writeDataFile(data);
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
