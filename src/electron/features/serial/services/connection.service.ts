// src/electron/features/serial/services/connection.service.ts

import type { BrowserWindow } from 'electron';
import { SerialPort } from 'serialport';

import type { ISerialPort, ISerialPortManager } from '../serial.types';
import { SerialIPC } from '../serial.types';
import { STORAGE_KEYS } from '../serial.constants';
import { createMockSerialPort, getMockSerialPorts } from './mock-port.service';
import { isValidPortPath, createPortError } from '../serial.utils';
import { appDataStorage } from '../../app-data';
import { logger } from '../../logger';
import { getSerialConfigManager } from '../serial.config';

export class ConnectionService {
  constructor(
    private readonly win: BrowserWindow,
    private readonly manager: ISerialPortManager,
  ) { }

  /**
   * Автоподключение к последнему порту
   */
  async autoConnect(): Promise<void> {
    return logger.withLogging('Connection', 'Auto-connect attempt', async () => {
      const configManager = getSerialConfigManager();

      if (!configManager.isAutoConnectEnabled()) {
        logger.debug('Connection', 'Auto-connect disabled');
        return;
      }

      const lastPort = appDataStorage.get<string>(STORAGE_KEYS.LAST_PORT);
      const lastBaud = appDataStorage.get<number>(STORAGE_KEYS.BAUD_RATE);

      if (lastPort === undefined || lastPort.length === 0) {
        logger.info('Connection', 'No last port saved');
        this.win.webContents.send(SerialIPC.AutoConnectNone);
        return;
      }

      const baudRate = lastBaud ?? configManager.getBaudRate();

      logger.info('Connection', 'Attempting auto-connect', {
        port: lastPort,
        baudRate,
      });

      try {
        // Проверяем существует ли порт
        const exists = await this.checkPortExists(lastPort);

        if (!exists) {
          logger.info('Connection', 'Last port not found', { port: lastPort });
          this.win.webContents.send(SerialIPC.AutoConnectFailed, lastPort);
          return;
        }

        // Создаём и открываем порт
        const port = await this.createPort(lastPort, baudRate);
        await this.manager.openPort(lastPort, port);

        this.win.webContents.send(SerialIPC.AutoConnected, lastPort);
        logger.info('Connection', 'Auto-connect successful', { port: lastPort });
      } catch (err) {
        logger.error('Connection', 'Auto-connect error', { port: lastPort }, err);
        this.win.webContents.send(SerialIPC.AutoConnectError, {
          port: lastPort,
          error: String(err),
        });
      }
    });
  }

  /**
   * Открыть порт
   */
  async openPort(path: string, baudRate?: number): Promise<void> {
    return logger.withLogging(
      'Connection',
      'Open port',
      async () => {
        if (!isValidPortPath(path)) {
          throw createPortError('Invalid Port Path', `Path "${path}" is not valid`, path);
        }

        const configManager = getSerialConfigManager();
        const actualBaudRate = baudRate ?? configManager.getBaudRate();

        // Получаем текущий открытый порт
        const activePorts = this.manager.getActivePorts();
        const currentPort = activePorts.length > 0 ? activePorts[0] : null;

        // Если пытаемся открыть уже открытый порт
        if (currentPort === path) {
          logger.info('Connection', 'Port already open', { path });
          return;
        }

        // Создаём новый порт
        const port = await this.createPort(path, actualBaudRate);

        // Переключаемся на новый порт
        await this.manager.switchPort(currentPort, path, port);

        // Сохраняем в настройки
        appDataStorage.set(STORAGE_KEYS.LAST_PORT, path);
        appDataStorage.set(STORAGE_KEYS.BAUD_RATE, actualBaudRate);

        logger.info('Connection', 'Port opened successfully', {
          path,
          baudRate: actualBaudRate,
        });
      },
      { path, baudRate },
    );
  }

  /**
   * Закрыть порт
   */
  async closePort(path: string): Promise<void> {
    return logger.withLogging(
      'Connection',
      'Close port',
      async () => {
        if (!this.manager.isPortOpen(path)) {
          logger.warn('Connection', 'Port is not open', { path });
          throw createPortError('Port Not Open', `Port ${path} is not open`, path);
        }

        await this.manager.closePort(path);

        logger.info('Connection', 'Port closed successfully', { path });
      },
      { path },
    );
  }

  /**
   * Получить список портов
   */
  async getPorts(): Promise<Array<{ path: string; busy: boolean; manufacturer?: string }>> {
    return logger.withLogging('Connection', 'Get ports list', async () => {
      const configManager = getSerialConfigManager();
      const useMock = configManager.shouldUseMockPorts();

      const ports = useMock ? await getMockSerialPorts() : await SerialPort.list();

      const activePorts = this.manager.getActivePorts();

      const result = ports.map((p) => ({
        path: p.path,
        manufacturer: p.manufacturer,
        serialNumber: p.serialNumber,
        vendorId: p.vendorId,
        productId: p.productId,
        busy: activePorts.includes(p.path),
      }));

      logger.info('Connection', 'Ports retrieved', {
        count: result.length,
        mock: useMock,
      });

      return result;
    });
  }

  /**
   * Проверить существование порта
   */
  private async checkPortExists(path: string): Promise<boolean> {
    const configManager = getSerialConfigManager();
    const useMock = configManager.shouldUseMockPorts();

    const ports = useMock ? await getMockSerialPorts() : await SerialPort.list();

    return ports.some((p) => p.path === path);
  }

  /**
   * Создать порт (mock или реальный)
   */
  private async createPort(path: string, baudRate: number): Promise<ISerialPort> {
    const configManager = getSerialConfigManager();
    const useMock = configManager.shouldUseMockPorts();

    if (useMock) {
      return createMockSerialPort(path, baudRate);
    }

    // Реальный порт — НЕ открываем физически,
    // Python bridge сам откроет COM-порт
    return this.createRealPort(path, baudRate);
  }

  /**
   * Создать реальный Serial порт БЕЗ открытия
   * (открытием занимается Python bridge)
   */
  private createRealPort(path: string, baudRate: number): ISerialPort {
    // autoOpen: false — не открываем порт
    // Объект нужен только как носитель path/baudRate и эмиттер close/error
    const port = new SerialPort({ path, baudRate, autoOpen: false });
    return port as unknown as ISerialPort;
  }
}

/**
 * Создать сервис подключений
 */
export function createConnectionService(
  win: BrowserWindow,
  manager: ISerialPortManager,
): ConnectionService {
  return new ConnectionService(win, manager);
}
