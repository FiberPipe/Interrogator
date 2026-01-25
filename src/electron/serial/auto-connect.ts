import type { BrowserWindow } from 'electron';
import { SerialPort } from 'serialport';

import { appStorage } from '../storage/app-storage';
import { createMockSerialPort, getMockSerialPorts } from './mock-serial';
import type { ISerialPort } from './types';
import type { SerialPortManager } from './port-manager';
import { logger } from '../logger/utils';

const isDev = true;

export async function autoConnectSerial(
  win: BrowserWindow,
  manager: SerialPortManager,
): Promise<void> {
  const lastPort = appStorage.get<string>('lastPort') ?? '';
  const lastBaud = appStorage.get<number>('baudRate') ?? 115200;

  logger.info('[Serial] Auto-connect attempt:', { lastPort, lastBaud, isDev });

  if (!lastPort) {
    logger.info('[Serial] No last port saved');
    win.webContents.send('serial:auto-connect-none');
    return;
  }

  try {
    const ports = isDev ? await getMockSerialPorts() : await SerialPort.list();
    const exists = ports.some((p) => p.path === lastPort);

    if (!exists) {
      logger.info(`[Serial] Last port ${lastPort} not found`);
      win.webContents.send('serial:auto-connect-failed', lastPort);
      return;
    }

    logger.info(`[Serial] Auto-connecting to ${lastPort}`);

    const port: ISerialPort = isDev
      ? createMockSerialPort(lastPort, lastBaud)
      : (new SerialPort({ path: lastPort, baudRate: lastBaud }) as any as ISerialPort);

    await manager.openPort(lastPort, port);

    win.webContents.send('serial:auto-connected', lastPort);
    logger.info(`[Serial] ✅ Auto-connected to ${lastPort}`);
  } catch (e) {
    logger.error('[Serial] Auto-connect error:', e);
    win.webContents.send('serial:auto-connect-error', {
      port: lastPort,
      error: String(e),
    });
  }
}
