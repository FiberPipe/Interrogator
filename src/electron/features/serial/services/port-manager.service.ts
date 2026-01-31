// src/electron/features/serial/services/port-manager.service.ts

import type { BrowserWindow } from 'electron';

import type { ISerialPort, PortConnection, ISerialPortManager, IDataProcessor } from '../serial.types';
import { SerialIPC } from '../serial.types';
import { TIMEOUTS } from '../serial.constants';
import { createDataProcessor } from './data-processor.service';
import { createPortError, createTimeoutError } from '../serial.utils';
import { logger } from '../../logger';

export class PortManagerService implements ISerialPortManager {
  private connections = new Map<string, PortConnection>();
  private closingPorts = new Set<string>();

  constructor(private readonly win: BrowserWindow) {}

  /**
   * Проверить открыт ли порт
   */
  isPortOpen(path: string): boolean {
    return this.connections.has(path) && !this.closingPorts.has(path);
  }

  /**
   * Получить подключение
   */
  getConnection(path: string): PortConnection | undefined {
    return this.connections.get(path);
  }

  /**
   * Открыть порт
   */
  async openPort(path: string, port: ISerialPort): Promise<void> {
    return logger.withLogging(
      'PortManager',
      'Open port',
      async () => {
        // Проверяем, не закрывается ли порт сейчас
        if (this.closingPorts.has(path)) {
          throw createPortError('Port Busy', `Port ${path} is currently being closed`, path);
        }

        // Проверяем, не открыт ли уже
        if (this.connections.has(path)) {
          throw createPortError('Port Already Open', `Port ${path} is already open`, path);
        }

        // Создаём процессор данных
        const processor = createDataProcessor(path, this.win);
        await processor.startSession();

        // Сохраняем подключение
        this.connections.set(path, { port, processor });

        // Настраиваем обработчики событий
        this.setupPortHandlers(path, port, processor);

        logger.info('PortManager', 'Port opened successfully', { path });
      },
      { path },
    );
  }

  /**
   * Закрыть порт
   */
  async closePort(path: string): Promise<void> {
    return logger.withLogging(
      'PortManager',
      'Close port',
      async () => {
        const connection = this.connections.get(path);
        if (connection === undefined) {
          logger.warn('PortManager', 'Port not found in active connections', { path });
          return;
        }

        // Помечаем порт как закрывающийся
        this.closingPorts.add(path);

        const { port, processor } = connection;

        try {
          await this.closePortWithTimeout(path, port, processor);
        } finally {
          this.closingPorts.delete(path);
        }
      },
      { path },
    );
  }

  /**
   * Закрыть порт с таймаутом
   */
  private async closePortWithTimeout(
    path: string,
    port: ISerialPort,
    processor: IDataProcessor,
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!port.isOpen) {
        logger.debug('PortManager', 'Port already closed', { path });
        this.connections.delete(path);
        resolve();
        return;
      }

      // Таймаут на случай зависания
      const timeout = setTimeout(() => {
        logger.error('PortManager', 'Close timeout', { path, timeout: TIMEOUTS.CLOSE_PORT });
        this.connections.delete(path);
        reject(createTimeoutError('close', path, TIMEOUTS.CLOSE_PORT));
      }, TIMEOUTS.CLOSE_PORT);

      port.close(async (err) => {
        clearTimeout(timeout);

        if (err !== null && err !== undefined) {
          logger.error('PortManager', 'Error closing port', { path }, err);
        }

        // Завершаем сессию в БД
        try {
          await processor.endSession();
        } catch (dbErr) {
          logger.error('PortManager', 'Error ending session', { path }, dbErr);
        }

        // Удаляем из активных подключений
        this.connections.delete(path);

        logger.info('PortManager', 'Port closed successfully', { path });
        resolve();
      });
    });
  }

  /**
   * Закрыть все порты
   */
  async closeAllPorts(): Promise<void> {
    return logger.withLogging('PortManager', 'Close all ports', async () => {
      const activePorts = Array.from(this.connections.keys());

      logger.info('PortManager', 'Closing all ports', {
        count: activePorts.length,
        ports: activePorts,
      });

      const closeTasks = activePorts.map((path) =>
        this.closePort(path).catch((err) => {
          logger.error('PortManager', 'Error closing port in batch', { path }, err);
        }),
      );

      await Promise.all(closeTasks);

      logger.info('PortManager', 'All ports closed successfully');
    });
  }

  /**
   * Переключить порт
   */
  async switchPort(fromPath: string | null, toPath: string, newPort: ISerialPort): Promise<void> {
    return logger.withLogging(
      'PortManager',
      'Switch port',
      async () => {
        // Если уже подключены к целевому порту
        if (fromPath === toPath && this.connections.has(toPath)) {
          logger.debug('PortManager', 'Already connected to target port', { toPath });
          return;
        }

        // Закрываем старый порт если есть
        if (fromPath !== null && this.connections.has(fromPath)) {
          await this.closePort(fromPath);
          // Даём время на очистку
          await new Promise((resolve) => setTimeout(resolve, TIMEOUTS.SWITCH_DELAY));
        }

        // Открываем новый порт
        await this.openPort(toPath, newPort);

        logger.info('PortManager', 'Port switched successfully', {
          from: fromPath,
          to: toPath,
        });
      },
      { from: fromPath, to: toPath },
    );
  }

  /**
   * Получить список активных портов
   */
  getActivePorts(): string[] {
    return Array.from(this.connections.keys()).filter((path) => !this.closingPorts.has(path));
  }

  /**
   * Настроить обработчики событий порта
   */
  private setupPortHandlers(path: string, port: ISerialPort, processor: IDataProcessor): void {
    // Обработка данных
    port.on('data', async (data: Buffer) => {
      const dataString = data.toString().trim();
      if (dataString.length === 0) return;

      try {
        await processor.processData(dataString);
      } catch (err) {
        logger.error('PortManager', 'Data processing error', { path }, err);
      }
    });

    // Закрытие порта
    port.on('close', async () => {
      logger.info('PortManager', 'Port closed event received', { path });

      if (this.closingPorts.has(path)) {
        // Закрытие инициировано нами, не уведомляем клиент
        return;
      }

      // Неожиданное закрытие
      await processor.endSession();
      this.connections.delete(path);
      this.win.webContents.send(SerialIPC.Closed, path);
    });

    // Ошибка порта
    port.on('error', async (err: Error) => {
      logger.error('PortManager', 'Port error event received', { path }, err);

      await processor.endSession();
      this.connections.delete(path);
      this.closingPorts.delete(path);

      this.win.webContents.send(SerialIPC.Error, {
        port: path,
        error: err.message,
      });
    });
  }
}

/**
 * Создать менеджер портов
 */
export function createPortManager(win: BrowserWindow): ISerialPortManager {
  return new PortManagerService(win);
}
