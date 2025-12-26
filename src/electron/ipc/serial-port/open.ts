// src/main/serial/open.ts
import type { BrowserWindow } from 'electron';
import { ipcMain } from 'electron';
import { SerialPort } from 'serialport';
import { activePorts } from '../../state';
import { appStorage } from '../../storage/app-storage';
import { createMockSerialPort } from './mock-serial';
import type { SerialOpenResult, ISerialPort } from './types';

const isDev = process.env.NODE_ENV === 'development';

export function registerOpenPort(win: BrowserWindow): void {
  ipcMain.handle(
    'serial:open',
    async (_, path: string, baudRate = 115200): Promise<SerialOpenResult> => {
      try {
        console.log(`[Serial] Opening port ${path} at ${baudRate} baud`);
        console.log(`[Serial] isDev: ${isDev}, NODE_ENV: ${process.env.NODE_ENV}`);

        // Проверяем, не открыт ли уже порт
        if (activePorts.has(path)) {
          console.warn(`[Serial] ⚠️ Port ${path} already open - returning success`);
          // Возвращаем успех, так как порт уже работает
          return { ok: true };
        }

        const port: ISerialPort = isDev
          ? createMockSerialPort(path, baudRate)
          : new SerialPort({ path, baudRate }) as any as ISerialPort;

        activePorts.set(path, port);

        // Сохраняем последний порт
        appStorage.set('lastPort', path);
        appStorage.set('baudRate', baudRate);

        console.log(`[Serial] ✅ Port ${path} opened successfully using ${isDev ? 'MOCK' : 'REAL'} port`);

        // Обработчик данных
        port.on('data', (data: Buffer) => {
          const dataString = data.toString();
          console.log(`[Serial ${path}] 🔵 Data received, length: ${dataString.length}`);
          
          const payload = {
            port: path,
            data: dataString,
          };
          
          console.log(`[Serial ${path}] 📤 Sending to renderer`);
          win.webContents.send('serial:data', payload);
        });

        // Обработчик закрытия
        port.on('close', () => {
          console.log(`[Serial ${path}] 🔴 Port closed`);
          activePorts.delete(path);
          win.webContents.send('serial:closed', path);
        });

        // Обработчик ошибок
        port.on('error', (err: Error) => {
          console.error(`[Serial ${path}] ❌ Error:`, err);
          activePorts.delete(path);
          win.webContents.send('serial:error', {
            port: path,
            error: err.message,
          });
        });

        return { ok: true };
      } catch (err: any) {
        console.error(`[Serial] ❌ Failed to open port ${path}:`, err);
        return { error: err.message || 'Failed to open port' };
      }
    }
  );
}
