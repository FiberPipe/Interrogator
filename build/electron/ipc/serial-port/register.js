"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerGetPorts = registerGetPorts;
const electron_1 = require("electron");
const serialport_1 = require("serialport");
const state_1 = require("../../state");
function registerGetPorts() {
    electron_1.ipcMain.handle("serial:getPorts", async () => {
        const ports = await serialport_1.SerialPort.list();
        return ports.map((p) => ({
            path: p.path,
            manufacturer: p.manufacturer,
            serialNumber: p.serialNumber,
            vendorId: p.vendorId,
            productId: p.productId,
            busy: state_1.activePorts.has(p.path),
        }));
    });
}
