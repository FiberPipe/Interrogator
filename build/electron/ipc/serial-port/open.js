"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerOpenPort = registerOpenPort;
const electron_1 = require("electron");
const serialport_1 = require("serialport");
const state_1 = require("../../state");
function registerOpenPort(win) {
    electron_1.ipcMain.handle("serial:open", async (_, path, baudRate = 115200) => {
        if (state_1.activePorts.has(path))
            return { error: "Port already open" };
        const port = new serialport_1.SerialPort({ path, baudRate });
        state_1.activePorts.set(path, port);
        port.on("data", (data) => {
            win.webContents.send("serial:data", {
                port: path,
                data: data.toString(),
            });
        });
        port.on("close", () => {
            state_1.activePorts.delete(path);
            win.webContents.send("serial:closed", path);
        });
        return { ok: true };
    });
}
