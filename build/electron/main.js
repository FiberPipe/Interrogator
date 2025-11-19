"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const node_path_1 = __importDefault(require("node:path"));
const ipc_1 = require("./ipc");
let win = null;
async function createWindow() {
    win = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: node_path_1.default.join(__dirname, "preload.js"),
        },
    });
    (0, ipc_1.registerIpc)(win);
    await win.loadURL("http://localhost:3000");
}
electron_1.app.whenReady().then(createWindow);
