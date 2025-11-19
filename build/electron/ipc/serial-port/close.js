"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerClosePort = registerClosePort;
const electron_1 = require("electron");
const state_1 = require("../../state");
function registerClosePort() {
    electron_1.ipcMain.handle("serial:close", (_, path) => {
        const port = state_1.activePorts.get(path);
        if (!port)
            return { error: "Not opened" };
        port.close();
        state_1.activePorts.delete(path);
        return { ok: true };
    });
}
