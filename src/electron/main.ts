import { app, BrowserWindow } from "electron";
import { join } from "node:path";
import { registerIpc } from "./ipc";
import { existsSync } from "node:fs";

let win: BrowserWindow | null = null;

const preloadPath = join(__dirname, "preload.js");

async function createWindow() {
  win = new BrowserWindow({
    fullscreen: true,
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  registerIpc(win);

  await win.loadURL("http://localhost:3000");
}

console.log("Preload path:", preloadPath, "exists:", existsSync(preloadPath));
app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
