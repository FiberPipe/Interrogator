import { BrowserWindow, app, ipcMain, globalShortcut, dialog } from "electron";
import { join } from "node:path";
import { ApiService } from "./api";
import * as fs from "fs";
import * as path from "node:path";
import * as os from "node:os";

const DEFAULT_INPUTS_PATH = path.join(
  os.homedir(),
  "Documents",
  "Interrogator",
  "inputs.json"
);

const convertDataToJSON = (lastLines: string) => {
  if (!lastLines) return [];

  const DEFAULT_EOL = /,\s*[\r\n]+/;
  const lines = String(lastLines).trim().split(DEFAULT_EOL);

  // console.log("parsedLinesToArray", lines);

  const processedLines = lines.map((line: string) => {
    try {
      const parsedLine = JSON.parse(line);
      // console.log("Parsed successfully:", parsedLine);
      return parsedLine;
    } catch (error) {
      console.error("Error parsing JSON line:", line);
      console.error("Error message:", error);
      return null;
    }
  });

  // console.log("processedLinesToJSONObj", processedLines);

  return processedLines.filter((row) => row !== null).slice(-200);
};

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
    // await mainWindow.loadFile("build/index.html");
    // todo: поправить чтение переменных окружения, прокинуть их в package.json и поправить здесь сборку
    // await mainWindow.loadFile("build/index.html");     
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
    const parsedData = convertDataToJSON(rawData);

    try {
      return parsedData as any;
    } catch (err) {
      return rawData as T;
    }
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

function writeDataFile(filePath: string, data: Record<string, string>): void {
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
