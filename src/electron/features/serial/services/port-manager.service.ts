import type { BrowserWindow } from 'electron';

import type {
  ISerialPort,
  PortConnection,
  ISerialPortManager,
  IDataProcessor,
} from '../serial.types';
import { SerialIPC } from '../serial.types';
import { TIMEOUTS, STORAGE_KEYS, AVERAGING } from '../serial.constants';
import { createDataProcessor } from './data-processor.service';
import { PythonBridgeService } from './python-bridge.service';
import { createPortError, createTimeoutError } from '../serial.utils';
import { appDataStorage } from '../../app-data';
import { logger } from '../../logger';
import * as path from 'path';

const bridges = new Map<string, PythonBridgeService>();

export class PortManagerService implements ISerialPortManager {
  private connections = new Map<string, PortConnection>();
  private closingPorts = new Set<string>();

  constructor(private readonly win: BrowserWindow) {}

  isPortOpen(path: string): boolean {
    return this.connections.has(path) && !this.closingPorts.has(path);
  }

  getConnection(path: string): PortConnection | undefined {
    return this.connections.get(path);
  }

  async openPort(portPath: string, port: ISerialPort): Promise<void> {
    return logger.withLogging(
      'PortManager',
      'Open port',
      async () => {
        if (this.closingPorts.has(portPath)) {
          throw createPortError('Port Busy', `Port ${portPath} is currently being closed`, portPath);
        }

        if (this.connections.has(portPath)) {
          throw createPortError('Port Already Open', `Port ${portPath} is already open`, portPath);
        }

        const processor = createDataProcessor(portPath, this.win);
        await processor.startSession();

        this.connections.set(portPath, { port, processor });

        // Вместо setupPortHandlers с ReadlineParser — запускаем Python bridge
        this.setupPortHandlers(portPath, port, processor);

        logger.info('PortManager', 'Port opened successfully', { path: portPath });
      },
      { path: portPath },
    );
  }

  /**
   * Настроить обработчики — для mock порта оставляем старую логику,
   * для реального запускаем Python bridge
   */
  private setupPortHandlers(portPath: string, port: ISerialPort, processor: IDataProcessor): void {
    const isMock = portPath.includes('Mock') || portPath === port.path && (port as any).interval !== undefined;

    if (isMock) {
      // ---- Mock порт: JSON строки как раньше ----
      const { ReadlineParser } = require('@serialport/parser-readline');
      const parser = (port as any).pipe(new ReadlineParser({ delimiter: '\n' }));

      parser.on('data', async (line: string) => {
        const trimmedLine = line.trim();
        if (trimmedLine.length === 0) return;
        try {
          await processor.processData(trimmedLine);
        } catch (err) {
          logger.error('PortManager', 'Data processing error', { path: portPath }, err);
        }
      });
    } else {
      // ---- Реальный порт: Python читает COM, пишет JSON в stdout ----
      //
      // ВАЖНО: реальный SerialPort здесь НЕ открываем для чтения данных.
      // Python bridge сам откроет COM-порт.
      // port объект нужен только для baudRate и событий close/error.

      const scriptDir = path.join(__dirname, 'shared');
      const avgSec =
        appDataStorage.get<number>(STORAGE_KEYS.AVG_SEC) ?? AVERAGING.DEFAULT_AVG_SEC;
      const bridge = new PythonBridgeService(
        portPath,
        port.baudRate,
        processor,
        scriptDir,
        avgSec,
      );

      bridges.set(portPath, bridge);
      bridge.start();

      logger.info('PortManager', 'Python bridge started', { path: portPath });
    }

    // Обработчики close/error одинаковы для обоих случаев
    port.on('close', async () => {
      logger.info('PortManager', 'Port closed event received', { path: portPath });

      if (this.closingPorts.has(portPath)) return;

      // Неожиданное закрытие
      bridges.get(portPath)?.stop();
      bridges.delete(portPath);

      await processor.endSession();
      this.connections.delete(portPath);
      this.win.webContents.send(SerialIPC.Closed, portPath);
    });

    port.on('error', async (err: Error) => {
      logger.error('PortManager', 'Port error event received', { path: portPath }, err);

      bridges.get(portPath)?.stop();
      bridges.delete(portPath);

      await processor.endSession();
      this.connections.delete(portPath);
      this.closingPorts.delete(portPath);

      this.win.webContents.send(SerialIPC.Error, {
        port: portPath,
        error: err.message,
      });
    });
  }

  async closePort(portPath: string): Promise<void> {
    return logger.withLogging(
      'PortManager',
      'Close port',
      async () => {
        const connection = this.connections.get(portPath);
        if (connection === undefined) {
          logger.warn('PortManager', 'Port not found in active connections', { path: portPath });
          return;
        }

        this.closingPorts.add(portPath);

        // Останавливаем Python bridge до закрытия порта
        bridges.get(portPath)?.stop();
        bridges.delete(portPath);

        const { port, processor } = connection;

        try {
          await this.closePortWithTimeout(portPath, port, processor);
        } finally {
          this.closingPorts.delete(portPath);
        }
      },
      { path: portPath },
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
   * Изменить окно усреднения по времени (сек) на лету для всех активных
   * python-мостов и сохранить значение для последующих подключений.
   */
  setAveraging(avgSec: number): void {
    const clamped = Math.max(
      AVERAGING.MIN_AVG_SEC,
      Math.min(avgSec, AVERAGING.MAX_AVG_SEC),
    );

    appDataStorage.set(STORAGE_KEYS.AVG_SEC, clamped);

    for (const bridge of bridges.values()) {
      bridge.setAvgSec(clamped);
    }

    logger.info('PortManager', 'Averaging window updated', { avgSec: clamped });
  }
}

/**
 * Создать менеджер портов
 */
export function createPortManager(win: BrowserWindow): ISerialPortManager {
  return new PortManagerService(win);
}
