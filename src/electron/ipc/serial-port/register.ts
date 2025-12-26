// src/main/serial/register.ts
import { ipcMain } from 'electron';
import { SerialPort } from 'serialport';
import { activePorts } from '../../state';
import { getMockSerialPorts } from './mock-serial';
import type { SerialPortInfo } from './types';

const isDev = true;

export function registerGetPorts(): void {
  ipcMain.handle('serial:getPorts', async (): Promise<SerialPortInfo[]> => {
    try {
      console.log('[Serial] Getting ports list');
      console.log('[Serial] isDev:', isDev, 'NODE_ENV:', process.env.NODE_ENV);
      
      const ports = isDev
        ? await getMockSerialPorts()
        : await SerialPort.list();

      const result: SerialPortInfo[] = ports.map((p) => ({
        path: p.path,
        manufacturer: p.manufacturer,
        serialNumber: p.serialNumber,
        vendorId: p.vendorId,
        productId: p.productId,
        busy: activePorts.has(p.path),
      }));

      console.log('[Serial] Found ports:', result);
      console.log('[Serial] Using', isDev ? 'MOCK' : 'REAL', 'ports');
      
      return result;
    } catch (err) {
      console.error('[Serial] Error getting ports:', err);
      throw err;
    }
  });
}
