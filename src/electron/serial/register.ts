import { ipcMain } from 'electron';
import { SerialPort } from 'serialport';
import { getMockSerialPorts } from './mock-serial';
import type { SerialPortInfo } from './types';
import type { SerialPortManager } from './port-manager';

const isDev = true;

export function registerGetPorts(manager: SerialPortManager): void {
  ipcMain.handle('serial:getPorts', async (): Promise<SerialPortInfo[]> => {
    try {
      console.log('[Serial] Getting ports list');

      const ports = isDev ? await getMockSerialPorts() : await SerialPort.list();

      const activePorts = manager.getActivePorts();

      const result: SerialPortInfo[] = ports.map((p) => ({
        path: p.path,
        manufacturer: p.manufacturer,
        serialNumber: p.serialNumber,
        vendorId: p.vendorId,
        productId: p.productId,
        busy: activePorts.includes(p.path),
      }));

      console.log('[Serial] Found ports:', result);
      return result;
    } catch (err) {
      console.error('[Serial] Error getting ports:', err);
      throw err;
    }
  });
}
