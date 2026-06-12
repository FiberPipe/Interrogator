// src/electron/features/ase/ase.port.ts
//
// Транспорт ASE: открывает COM-порт на чтение и запись (9600 8N1),
// отправляет кадры и собирает кадры-ответы с сопоставлением по таймауту.

import { SerialPort } from 'serialport';

import { ASE_RESPONSE_TIMEOUT, ASE_SERIAL } from './ase.constants';
import { expectedResponseLength, RESPONSE_OVERHEAD } from './ase.protocol';
import { logger } from '../logger';

interface PendingRequest {
  resolve: (frame: Buffer) => void;
  reject: (error: Error) => void;
  timer: NodeJS.Timeout;
}

/**
 * Низкоуровневая обёртка над физическим портом ASE.
 * Команды сериализуются: одновременно обрабатывается один запрос.
 */
export class AsePort {
  private port: SerialPort | null = null;
  private rxBuffer = Buffer.alloc(0);
  private pending: PendingRequest | null = null;

  constructor(
    readonly path: string,
    private readonly onClosed: (path: string) => void,
    private readonly onError: (path: string, error: string) => void,
  ) {}

  get isOpen(): boolean {
    return this.port?.isOpen ?? false;
  }

  async open(): Promise<void> {
    if (this.isOpen) return;

    await new Promise<void>((resolve, reject) => {
      const port = new SerialPort({
        path: this.path,
        baudRate: ASE_SERIAL.baudRate,
        dataBits: ASE_SERIAL.dataBits,
        parity: ASE_SERIAL.parity,
        stopBits: ASE_SERIAL.stopBits,
        autoOpen: false,
      });

      port.open((err) => {
        if (err) {
          reject(err);
          return;
        }
        this.port = port;
        this.attachHandlers(port);
        logger.info('ASE', 'Port opened', { path: this.path });
        resolve();
      });
    });
  }

  private attachHandlers(port: SerialPort): void {
    port.on('data', (chunk: Buffer) => this.handleData(chunk));

    port.on('close', () => {
      logger.info('ASE', 'Port closed', { path: this.path });
      this.failPending(new Error('Port closed'));
      this.port = null;
      this.onClosed(this.path);
    });

    port.on('error', (err: Error) => {
      logger.error('ASE', 'Port error', { path: this.path }, err);
      this.failPending(err);
      this.onError(this.path, err.message);
    });
  }

  private handleData(chunk: Buffer): void {
    this.rxBuffer = Buffer.concat([this.rxBuffer, chunk]);

    if (this.pending === null) {
      // Нежданные данные — отбрасываем, чтобы не копить мусор.
      this.rxBuffer = Buffer.alloc(0);
      return;
    }

    if (this.rxBuffer.length < RESPONSE_OVERHEAD) return;

    const len = this.rxBuffer[3];
    const total = expectedResponseLength(len);

    if (this.rxBuffer.length < total) return;

    const frame = this.rxBuffer.subarray(0, total);
    this.rxBuffer = this.rxBuffer.subarray(total);

    const { resolve, timer } = this.pending;
    clearTimeout(timer);
    this.pending = null;
    resolve(Buffer.from(frame));
  }

  private failPending(error: Error): void {
    if (this.pending === null) return;
    clearTimeout(this.pending.timer);
    this.pending.reject(error);
    this.pending = null;
  }

  /**
   * Отправить кадр и дождаться полного кадра-ответа.
   */
  async sendCommand(frame: Buffer): Promise<Buffer> {
    if (this.port === null || !this.port.isOpen) {
      throw new Error('ASE port is not open');
    }

    if (this.pending !== null) {
      throw new Error('ASE command already in progress');
    }

    this.rxBuffer = Buffer.alloc(0);

    return new Promise<Buffer>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending = null;
        reject(new Error('ASE response timeout'));
      }, ASE_RESPONSE_TIMEOUT);

      this.pending = { resolve, reject, timer };

      this.port?.write(frame, (err) => {
        if (err) {
          clearTimeout(timer);
          this.pending = null;
          reject(err);
        }
      });
    });
  }

  async close(): Promise<void> {
    const port = this.port;
    if (port === null) return;

    this.failPending(new Error('Port closing'));

    await new Promise<void>((resolve) => {
      if (!port.isOpen) {
        resolve();
        return;
      }
      port.close(() => resolve());
    });

    this.port = null;
  }
}
