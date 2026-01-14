// src/main/serial/open.ts
import type { BrowserWindow } from 'electron';
import { ipcMain } from 'electron';
import { SerialPort } from 'serialport';
import { activePorts } from '../../state';
import { appStorage } from '../../storage/app-storage';
import { createMockSerialPort } from './mock-serial';
import type { SerialOpenResult, ISerialPort } from './types';

const isDev = process.env.NODE_ENV === 'development' || true; // Force mock for testing

export function registerOpenPort(win: BrowserWindow): void {
  ipcMain.handle(
    'serial:open',
    async (_, path: string, baudRate = 115200): Promise<SerialOpenResult> => {
      try {
        console.log(`[Serial] Opening port ${path} at ${baudRate} baud`);
        console.log(`[Serial] isDev: ${isDev}, using ${isDev ? 'MOCK' : 'REAL'} port`);

        // Проверяем, не открыт ли уже порт
        if (activePorts.has(path)) {
          const existingPort = activePorts.get(path);
          
          // Проверяем, действительно ли порт открыт
          if (existingPort?.isOpen) {
            console.warn(`[Serial] ⚠️ Port ${path} already open - returning success`);
            return { ok: true };
          } else {
            // Порт есть в мапе, но закрыт - удаляем его
            console.log(`[Serial] Removing stale port reference for ${path}`);
            activePorts.delete(path);
          }
        }

        console.log(`[Serial] Creating new ${isDev ? 'MOCK' : 'REAL'} port for ${path}`);
        
        const port: ISerialPort = isDev
          ? createMockSerialPort(path, baudRate)
          : new SerialPort({ path, baudRate, autoOpen: false }) as any as ISerialPort;

        // Для реальных портов нужно открыть
        if (!isDev && 'open' in port) {
          await new Promise<void>((resolve, reject) => {
            (port as any).open((err: Error | null) => {
              if (err) reject(err);
              else resolve();
            });
          });
        }

        activePorts.set(path, port);

        // Сохраняем последний порт
        appStorage.set('lastPort', path);
        appStorage.set('baudRate', baudRate);

        console.log(`[Serial] ✅ Port ${path} opened successfully`);

        // Обработчик данных
        port.on('data', (data: Buffer) => {
          const dataString = data.toString();
          console.log(`[Serial ${path}] 🔵 Data received, length: ${dataString.length}`);
          
          win.webContents.send('serial:data', {
            port: path,
            data: dataString,
          });
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
        // Убеждаемся что порт не остался в активных
        activePorts.delete(path);
        return { error: err.message || 'Failed to open port' };
      }
    }
  );
}
