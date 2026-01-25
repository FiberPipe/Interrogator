import type { BrowserWindow } from 'electron';

import type { ISerialPort } from './types';
import { SerialDataProcessor } from './data-processor';

interface PortConnection {
  port: ISerialPort;
  processor: SerialDataProcessor;
}

export class SerialPortManager {
  private connections = new Map<string, PortConnection>();
  private win: BrowserWindow;
  private closingPorts = new Set<string>();

  constructor(win: BrowserWindow) {
    this.win = win;
  }

  isPortOpen(path: string): boolean {
    return this.connections.has(path) && !this.closingPorts.has(path);
  }

  getConnection(path: string): PortConnection | undefined {
    return this.connections.get(path);
  }

  async openPort(path: string, port: ISerialPort): Promise<void> {
    console.log(`[PortManager] Opening port ${path}`);

    // Проверяем, не закрывается ли порт сейчас
    if (this.closingPorts.has(path)) {
      throw new Error(`Port ${path} is currently being closed`);
    }

    // Создаём процессор данных
    const processor = new SerialDataProcessor(path, this.win);
    await processor.startSession();

    // Сохраняем подключение
    this.connections.set(path, { port, processor });

    // Настраиваем обработчики событий
    this.setupPortHandlers(path, port, processor);

    console.log(`[PortManager] Port ${path} opened and ready`);
  }

  async closePort(path: string): Promise<void> {
    console.log(`[PortManager] Closing port ${path}`);

    const connection = this.connections.get(path);
    if (!connection) {
      console.warn(`[PortManager] Port ${path} not found in active connections`);
      return;
    }

    // Помечаем порт как закрывающийся
    this.closingPorts.add(path);

    const { port, processor } = connection;

    try {
      return await new Promise<void>((resolve, reject) => {
        if (!port.isOpen) {
          console.log(`[PortManager] Port ${path} already closed`);
          this.connections.delete(path);
          this.closingPorts.delete(path);
          resolve();
          return;
        }

        // Таймаут на случай зависания
        const timeout = setTimeout(() => {
          console.error(`[PortManager] Timeout closing port ${path}`);
          this.connections.delete(path);
          this.closingPorts.delete(path);
          reject(new Error('Close timeout'));
        }, 5000);

        port.close(async (err) => {
          clearTimeout(timeout);

          if (err) {
            console.error(`[PortManager] Error closing port ${path}:`, err);
          }

          // Завершаем сессию в БД
          try {
            await processor.endSession();
          } catch (dbErr) {
            console.error(`[PortManager] Error ending session for ${path}:`, dbErr);
          }

          // Удаляем из активных подключений
          this.connections.delete(path);
          this.closingPorts.delete(path);

          console.log(`[PortManager] Port ${path} closed successfully`);
          resolve();
        });
      });
    } catch (err) {
      this.closingPorts.delete(path);
      throw err;
    }
  }

  async closeAllPorts(): Promise<void> {
    console.log(`[PortManager] Closing all ports (${this.connections.size})`);

    const closeTasks = Array.from(this.connections.keys()).map((path) =>
      this.closePort(path).catch((err) => {
        console.error(`[PortManager] Error closing ${path}:`, err);
      }),
    );

    await Promise.all(closeTasks);
    console.log(`[PortManager] All ports closed`);
  }

  async switchPort(fromPath: string | null, toPath: string, newPort: ISerialPort): Promise<void> {
    console.log(`[PortManager] Switching from ${fromPath || 'none'} to ${toPath}`);

    // Если уже подключены к целевому порту
    if (fromPath === toPath && this.connections.has(toPath)) {
      console.log(`[PortManager] Already connected to ${toPath}`);
      return;
    }

    // Закрываем старый порт если есть
    if (fromPath && this.connections.has(fromPath)) {
      await this.closePort(fromPath);
      // Даём время на очистку
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    // Открываем новый порт
    await this.openPort(toPath, newPort);
  }

  getActivePorts(): string[] {
    return Array.from(this.connections.keys()).filter((path) => !this.closingPorts.has(path));
  }

  private setupPortHandlers(path: string, port: ISerialPort, processor: SerialDataProcessor): void {
    port.on('data', async (data: Buffer) => {
      const dataString = data.toString().trim();
      if (!dataString) return;

      try {
        await processor.processData(dataString);
      } catch (err) {
        console.error(`[PortManager ${path}] Data processing error:`, err);
      }
    });

    port.on('close', async () => {
      console.log(`[PortManager ${path}] Port closed event`);

      if (this.closingPorts.has(path)) {
        // Закрытие инициировано нами, не уведомляем клиент
        return;
      }

      // Неожиданное закрытие
      await processor.endSession();
      this.connections.delete(path);
      this.win.webContents.send('serial:closed', path);
    });

    port.on('error', async (err: Error) => {
      console.error(`[PortManager ${path}] Port error:`, err);

      await processor.endSession();
      this.connections.delete(path);
      this.closingPorts.delete(path);

      this.win.webContents.send('serial:error', {
        port: path,
        error: err.message,
      });
    });
  }
}
