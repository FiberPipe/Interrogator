"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSerialPortIpc = registerSerialPortIpc;
const close_1 = require("./close");
const open_1 = require("./open");
const register_1 = require("./register");
const auto_connect_1 = require("./auto-connect");
function registerSerialPortIpc(win) {
    (0, register_1.registerGetPorts)();
    (0, open_1.registerOpenPort)(win);
    (0, close_1.registerClosePort)();
    win.webContents.on('did-finish-load', () => {
        (0, auto_connect_1.autoConnectSerial)(win);
    });
}
