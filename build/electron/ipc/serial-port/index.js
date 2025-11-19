"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSerialPortIpc = registerSerialPortIpc;
const close_1 = require("./close");
const open_1 = require("./open");
const register_1 = require("./register");
function registerSerialPortIpc(win) {
    (0, register_1.registerGetPorts)();
    (0, open_1.registerOpenPort)(win);
    (0, close_1.registerClosePort)();
}
