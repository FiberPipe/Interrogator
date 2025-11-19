"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const node_path_1 = require("node:path");
const ipc_1 = require("./ipc");
const node_fs_1 = require("node:fs");
let win = null;
const preloadPath = (0, node_path_1.join)(__dirname, "preload.js");
async function createWindow() {
    win = new electron_1.BrowserWindow({
        fullscreen: true,
        webPreferences: {
            preload: (0, node_path_1.join)(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });
    (0, ipc_1.registerIpc)(win);
    await win.loadURL("http://localhost:3000");
}
console.log("Preload path:", preloadPath, "exists:", (0, node_fs_1.existsSync)(preloadPath));
electron_1.app.whenReady().then(createWindow);
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin")
        electron_1.app.quit();
});
electron_1.app.on("activate", () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0)
        createWindow();
});
