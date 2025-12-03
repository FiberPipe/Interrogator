"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerOpenPort = registerOpenPort;
const electron_1 = require("electron");
const serialport_1 = require("serialport");
const state_1 = require("../../state");
const app_storage_1 = require("../../storage/app-storage");
function registerOpenPort(win) {
    electron_1.ipcMain.handle('serial:open', async (_, path, baudRate = 115200) => {
        try {
            if (state_1.activePorts.has(path)) {
                return { error: 'Port already open' };
            }
            const port = new serialport_1.SerialPort({ path, baudRate });
            state_1.activePorts.set(path, port);
            app_storage_1.appStorage.set('lastPort', path);
            app_storage_1.appStorage.set('baudRate', baudRate);
            port.on('data', (data) => {
                win.webContents.send('serial:data', {
                    port: path,
                    data: data.toString(),
                });
            });
            port.on('close', () => {
                state_1.activePorts.delete(path);
                win.webContents.send('serial:closed', path);
            });
            return { ok: true };
        }
        catch (err) {
            return { error: err.message || 'Failed to open port' };
        }
    });
}
