import { SerialDataProcessor } from "./ipc/serial-port/data-processor";
import { ISerialPort } from "./ipc/serial-port/types";

export const activePorts = new Map<string, ISerialPort>();
export const activeProcessors = new Map<string, SerialDataProcessor>();
