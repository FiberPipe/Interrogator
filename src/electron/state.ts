import type { SerialPort } from 'serialport';

export const activePorts: Map<string, SerialPort> = new Map();
