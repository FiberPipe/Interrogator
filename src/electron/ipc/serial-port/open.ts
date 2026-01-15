import type { BrowserWindow } from 'electron';
import { ipcMain } from 'electron';
import { SerialPort } from 'serialport';
import { activePorts, activeProcessors } from '../../state';
import { appStorage } from '../../storage/app-storage';
import { createMockSerialPort } from './mock-serial';
import type { SerialOpenResult, ISerialPort } from './types';
import { SerialDataProcessor } from './data-processor';

const isDev = process.env.NODE_ENV === 'development' || true;

export function registerOpenPort(win: BrowserWindow): void {
  ipcMain.handle(
    'serial:open',
    async (_, path: string, baudRate = 115200): Promise<SerialOpenResult> => {
      try {
        console.log(`[Serial] Opening port ${path} at ${baudRate} baud`);

        // Проверяем, не открыт ли уже порт
        if (activePorts.has(path)) {
          const existingPort = activePorts.get(path);
          
          if (existingPort?.isOpen) {
            console.warn(`[Serial] Port ${path} already open`);
            return { ok: true };
          } else {
            console.log(`[Serial] Removing stale port reference for ${path}`);
            activePorts.delete(path);
            activeProcessors.delete(path);
          }
        }

        console.log(`[Serial] Creating new ${isDev ? 'MOCK' : 'REAL'} port for ${path}`);
        
        const port: ISerialPort = isDev
          ? createMockSerialPort(path, baudRate)
          : new SerialPort({ path, baudRate, autoOpen: false }) as any as ISerialPort;

        if (!isDev && 'open' in port) {
          await new Promise<void>((resolve, reject) => {
            (port as any).open((err: Error | null) => {
              if (err) reject(err);
              else resolve();
            });
          });
        }

        activePorts.set(path, port);

        // Создаём процессор данных
        const processor = new SerialDataProcessor(path, win);
        await processor.startSession();
        activeProcessors.set(path, processor);

        appStorage.set('lastPort', path);
        appStorage.set('baudRate', baudRate);

        console.log(`[Serial] Port ${path} opened successfully`);

        // Обработчик данных - теперь через процессор
        port.on('data', (data: Buffer) => {
          const dataString = data.toString().trim();
          
          // Обрабатываем данные через процессор (параллельно БД + клиент)
          processor.processData(dataString).catch((err) => {
            console.error(`[Serial ${path}] Processing error:`, err);
          });
        });

        // Обработчик закрытия
        port.on('close', async () => {
          console.log(`[Serial ${path}] Port closed`);
          
          // Завершаем сессию
          await processor.endSession();
          
          activePorts.delete(path);
          activeProcessors.delete(path);
          
          win.webContents.send('serial:closed', path);
        });

        // Обработчик ошибок
        port.on('error', async (err: Error) => {
          console.error(`[Serial ${path}] Error:`, err);
          
          await processor.endSession();
          
          activePorts.delete(path);
          activeProcessors.delete(path);
          
          win.webContents.send('serial:error', {
            port: path,
            error: err.message,
          });
        });

        return { ok: true };
      } catch (err: any) {
        console.error(`[Serial] Failed to open port ${path}:`, err);
        activePorts.delete(path);
        activeProcessors.delete(path);
        return { error: err.message || 'Failed to open port' };
      }
    }
  );
}
