import { app, BrowserWindow } from "electron";
import path from "node:path";
import { registerIpc } from "./ipc";

let win: BrowserWindow | null = null;

async function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  registerIpc(win);

  await win.loadURL("http://localhost:3000");
}

app.whenReady().then(createWindow);
