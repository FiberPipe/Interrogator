"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerIpc = registerIpc;
const serial_port_1 = require("./serial-port");
const app_data_1 = require("./app-data");
function registerIpc(win) {
    (0, serial_port_1.registerSerialPortIpc)(win);
    (0, app_data_1.registerAppDataIpc)();
}
