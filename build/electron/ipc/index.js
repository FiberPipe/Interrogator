"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerIpc = registerIpc;
const serial_port_1 = require("./serial-port");
function registerIpc(win) {
    (0, serial_port_1.registerSerialPortIpc)(win);
}
