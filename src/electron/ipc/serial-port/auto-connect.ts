// src/main/serial/auto-connect.ts
import type { BrowserWindow } from 'electron';
import { SerialPort } from 'serialport';
import { appStorage } from '../../storage/app-storage';
import { activePorts } from '../../state';
import { createMockSerialPort, getMockSerialPorts } from './mock-serial';
import type { ISerialPort } from './types';

const isDev = true;

export async function autoConnectSerial(win: BrowserWindow): Promise<void> {
  const lastPort = appStorage.get<string>('lastPort') ?? '';
  const lastBaud = appStorage.get<number>('baudRate') ?? 115200;

  console.log('[Serial] Auto-connect attempt:', { lastPort, lastBaud, isDev });

  if (!lastPort) {
    console.log('[Serial] No last port saved');
    win.webContents.send('serial:auto-connect-none');
    return;
  }

  try {
    const ports = true 
      ? await getMockSerialPorts()
      : await SerialPort.list();
      
    const exists = ports.some((p) => p.path === lastPort);

    if (!exists) {
      console.log(`[Serial] Last port ${lastPort} not found`);
      win.webContents.send('serial:auto-connect-failed', lastPort);
      return;
    }

    console.log(`[Serial] Auto-connecting to ${lastPort} using ${isDev ? 'MOCK' : 'REAL'} port`);

    const port: ISerialPort = isDev
      ? createMockSerialPort(lastPort, lastBaud)
      : new SerialPort({ path: lastPort, baudRate: lastBaud }) as any as ISerialPort;

    activePorts.set(lastPort, port);

    win.webContents.send('serial:auto-connected', lastPort);
    console.log(`[Serial] Auto-connected to ${lastPort}`);

    port.on('data', (data: Buffer) => {
      const dataString = data.toString();
      console.log(`[Serial ${lastPort}] 🔵 Data received:`, dataString.substring(0, 100));
      
      win.webContents.send('serial:data', {
        port: lastPort,
        data: dataString,
      });
    });

    port.on('close', () => {
      console.log(`[Serial ${lastPort}] Port closed`);
      activePorts.delete(lastPort);
      win.webContents.send('serial:closed', lastPort);
    });

    port.on('error', (err: Error) => {
      console.error(`[Serial ${lastPort}] Error:`, err);
      activePorts.delete(lastPort);
      win.webContents.send('serial:error', {
        port: lastPort,
        error: err.message,
      });
    });

  } catch (e) {
    console.error('[Serial] Auto-connect error:', e);
    win.webContents.send('serial:auto-connect-error', {
      port: lastPort,
      error: String(e),
    });
  }
}
