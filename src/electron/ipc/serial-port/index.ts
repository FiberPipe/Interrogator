import { BrowserWindow } from "electron";
import { registerClosePort } from "./close";
import { registerOpenPort } from "./open";
import { registerGetPorts } from "./register";

export function registerSerialPortIpc(win: BrowserWindow) {
  registerGetPorts();
  registerOpenPort(win);
  registerClosePort();
}