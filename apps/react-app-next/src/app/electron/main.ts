import { BrowserWindow, app, ipcMain, dialog } from "electron";
import { join } from "node:path";
import { ApiService } from "./api";
import * as path from "node:path";
import * as os from "node:os";
import { readDataFile, writeDataFile } from "./utils";

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

ipcMain.handle("getFilePaths", async () => {
  try {
    return readDataFile(DEFAULT_FILE_PATHS_PATH, {});
  } catch (e) {
    console.error(e);
    return {}
  }
});

ipcMain.handle("getSensorsData", async (_e: unknown, path: string) => {
  try {
    return readDataFile(path, []).slice(-200);
  } catch (e) {
    console.error(e);
    return [];
  }
});

ipcMain.handle("setFilePaths", async (_, filePaths) => {
  try {
    const currentPaths = readDataFile<Record<string, string>>(DEFAULT_FILE_PATHS_PATH, {});

    const updatedPaths = { ...currentPaths, ...filePaths };

    writeDataFile(DEFAULT_FILE_PATHS_PATH, updatedPaths);

    return updatedPaths;
  } catch (e) {
    console.error(e);
    return {}
  }
});