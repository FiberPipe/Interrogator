import { BrowserWindow } from "electron";
import * as path from "path";
import { setupPortPickerHandlers } from "./port-picker";
import { setupIpcHandlers } from "./ipc-handlers";

export async function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 1080,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const env = process.env.NODE_ENV || "development";
  if (env === "production") {
    await mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  } else {
    await mainWindow.loadURL("http://localhost:3000/");
  }

  await setupPortPickerHandlers(mainWindow);
  await setupIpcHandlers(mainWindow);

  return mainWindow;
}
