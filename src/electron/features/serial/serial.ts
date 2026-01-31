// src/electron/features/serial/serial.ts

import type { BrowserWindow } from 'electron';

import type { ISerialPortManager } from './serial.types';
import { createPortManager } from './services/port-manager.service';
import { createConnectionService } from './services/connection.service';
import { registerSerialIpc } from './serial.ipc';
import { initializeSerialConfig } from './serial.config';
import { logger } from '../logger';

/**
 * Главный класс для управления Serial портами
 */
export class SerialManager {
  private portManager: ISerialPortManager;
  private connectionService: ReturnType<typeof createConnectionService>;
  private isInitialized = false;

  constructor(private readonly win: BrowserWindow) {
    this.portManager = createPortManager(win);
    this.connectionService = createConnectionService(win, this.portManager);
  }

  /**
   * Инициализация Serial модуля
   */
  initialize(): void {
    if (this.isInitialized) {
      logger.warn('Serial', 'Already initialized');
      return;
    }

    return logger.withLoggingSync('Serial', 'Initialize', () => {
      // Инициализируем конфигурацию
      initializeSerialConfig();

      // Регистрируем IPC handlers
      registerSerialIpc(this.win, this.portManager);

      // Настраиваем автоподключение после загрузки окна
      this.setupAutoConnect();

      // Настраиваем cleanup при закрытии
      this.setupCleanup();

      this.isInitialized = true;

      logger.info('Serial', 'Initialized successfully');
    });
  }

  /**
   * Настроить автоподключение
   */
  private setupAutoConnect(): void {
    this.win.webContents.on('did-finish-load', () => {
      logger.info('Serial', 'Window loaded, attempting auto-connect');
      void this.connectionService.autoConnect();
    });
  }

  /**
   * Настроить cleanup при закрытии
   */
  private setupCleanup(): void {
    this.win.on('close', () => {
      logger.info('Serial', 'Window closing, cleaning up ports');
      void this.shutdown();
    });
  }

  /**
   * Получить менеджер портов
   */
  getPortManager(): ISerialPortManager {
    return this.portManager;
  }

  /**
   * Завершение работы
   */
  async shutdown(): Promise<void> {
    return logger.withLogging('Serial', 'Shutdown', async () => {
      await this.portManager.closeAllPorts();
      this.isInitialized = false;
      logger.info('Serial', 'Shutdown complete');
    });
  }
}

/**
 * Создать Serial менеджер
 */
export function createSerialManager(win: BrowserWindow): SerialManager {
  return new SerialManager(win);
}
