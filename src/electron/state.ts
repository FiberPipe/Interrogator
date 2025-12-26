import { ISerialPort } from "./ipc/serial-port/types";

export const activePorts = new Map<string, ISerialPort>();
