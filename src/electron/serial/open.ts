import type { BrowserWindow } from 'electron';
import { ipcMain } from 'electron';
import { SerialPort } from 'serialport';

import { appStorage } from '../storage/app-storage';
import { createMockSerialPort } from './mock-serial';
import type { SerialOpenResult, ISerialPort } from './types';
import type { SerialPortManager } from './port-manager';
import { logger } from '../logger/utils';

const isDev = process.env.NODE_ENV === 'development' || true;

export function registerOpenPort(win: BrowserWindow, manager: SerialPortManager): void {
  ipcMain.handle(
    'serial:open',
    async (_, path: string, baudRate = 115200): Promise<SerialOpenResult> => {
      try {
        logger.info(`[Serial] Opening port ${path} at ${baudRate} baud`);

        // Получаем текущий открытый порт
        const activePorts = manager.getActivePorts();
        const currentPort = activePorts.length > 0 ? activePorts[0] : null;

        // Если пытаемся открыть уже открытый порт
        if (currentPort === path) {
          logger.info(`[Serial] Port ${path} already open`);
          return { ok: true };
        }

        // Создаём новый порт
        logger.info(`[Serial] Creating ${isDev ? 'MOCK' : 'REAL'} port for ${path}`);

        const port: ISerialPort = isDev
          ? createMockSerialPort(path, baudRate)
          : await createRealSerialPort(path, baudRate);

        // Переключаемся на новый порт (закрываем старый, открываем новый)
        await manager.switchPort(currentPort, path, port);

        // Сохраняем в настройки
        appStorage.set('lastPort', path);
        appStorage.set('baudRate', baudRate);

        logger.info(`[Serial] ✅ Successfully opened ${path}`);
        return { ok: true };
      } catch (err: any) {
        logger.error(`[Serial] ❌ Failed to open port ${path}:`, err);
        return { error: err.message || 'Failed to open port' };
      }
    },
  );
}

async function createRealSerialPort(path: string, baudRate: number): Promise<ISerialPort> {
  return new Promise((resolve, reject) => {
    const port = new SerialPort({ path, baudRate, autoOpen: false });

    port.open((err) => {
      if (err) {
        reject(err);
      } else {
        resolve(port as any as ISerialPort);
      }
    });
  });
}
