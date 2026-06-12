// src/electron/features/ase/ase.service.ts
//
// Высокоуровневое управление ASE-источником: подключение, чтение
// параметров, установка мощности (в mW) и включение/выключение излучения.

import type { BrowserWindow } from 'electron';

import { createAsePort } from './ase.port.factory';
import { AseIPC } from './ase.types';
import type { AseInfo, IAsePort } from './ase.types';
import {
  buildEnableRequest,
  buildInfoRequest,
  buildPowerRequest,
  mwToRaw,
  parseInfo,
  parseResponse,
} from './ase.protocol';
import { ASE_CMD } from './ase.constants';
import { logger } from '../logger';

export class AseService {
  private port: IAsePort | null = null;
  private info: AseInfo | null = null;

  constructor(private readonly win: BrowserWindow) {}

  isConnected(): boolean {
    return this.port?.isOpen ?? false;
  }

  getCachedInfo(): AseInfo | null {
    return this.info;
  }

  async connect(path: string): Promise<void> {
    return logger.withLogging(
      'ASE',
      'Connect',
      async () => {
        if (this.port !== null) {
          await this.disconnect();
        }

        const port = createAsePort(
          path,
          (closedPath) => this.handleClosed(closedPath),
          (errPath, error) => this.handleError(errPath, error),
        );

        await port.open();
        this.port = port;

        // Сразу читаем параметры устройства (Шаг 1 последовательности запуска).
        try {
          await this.getInfo();
        } catch (err) {
          logger.warn('ASE', 'Failed to read info on connect', { path }, err);
        }
      },
      { path },
    );
  }

  async disconnect(): Promise<void> {
    return logger.withLogging('ASE', 'Disconnect', async () => {
      await this.port?.close();
      this.port = null;
      this.info = null;
    });
  }

  /**
   * Прочитать параметры устройства (CMD 0xD1) и закэшировать.
   */
  async getInfo(): Promise<AseInfo> {
    const port = this.requirePort();
    const response = await port.sendCommand(buildInfoRequest());
    const { cmd, data } = parseResponse(response);

    if (cmd !== ASE_CMD.INFO) {
      throw new Error(`Unexpected response cmd: ${cmd.toString(16)}`);
    }

    this.info = parseInfo(data);
    logger.info('ASE', 'Info received', { ...this.info });
    return this.info;
  }

  /**
   * Установить мощность в mW. Возвращает фактически отправленное сырое значение.
   */
  async setPower(mW: number): Promise<number> {
    const port = this.requirePort();
    const info = this.info ?? (await this.getInfo());

    const raw = mwToRaw(mW, info);
    const response = await port.sendCommand(buildPowerRequest(raw));
    parseResponse(response);

    logger.info('ASE', 'Power set', { mW, raw, coeff: info.coeff });
    return raw;
  }

  /**
   * Включить/выключить излучение (CMD 0xC1).
   */
  async setEnabled(enabled: boolean): Promise<void> {
    const port = this.requirePort();
    const response = await port.sendCommand(buildEnableRequest(enabled));
    parseResponse(response);
    logger.info('ASE', 'Emission toggled', { enabled });
  }

  private requirePort(): IAsePort {
    if (this.port === null || !this.port.isOpen) {
      throw new Error('ASE port is not connected');
    }
    return this.port;
  }

  private handleClosed(path: string): void {
    this.port = null;
    this.info = null;
    this.win.webContents.send(AseIPC.Closed, path);
  }

  private handleError(path: string, error: string): void {
    this.win.webContents.send(AseIPC.Error, { port: path, error });
  }
}
