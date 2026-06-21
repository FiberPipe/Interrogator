// src/electron/features/ase/ase.service.ts
//
// Высокоуровневое управление ASE-источником: подключение, чтение
// параметров, установка мощности (в mW) и включение/выключение излучения.

import type { BrowserWindow } from 'electron';

import { createAsePort } from './ase.port.factory';
import { AseIPC } from './ase.types';
import type { AseInfo, AseStateEvent, AseTrafficEvent, IAsePort } from './ase.types';
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

/** Период опроса устройства для поддержания актуального состояния, мс. */
const STATE_POLL_INTERVAL = 2000;

export class AseService {
  private port: IAsePort | null = null;
  private info: AseInfo | null = null;

  // Актуальное состояние лазера (подтверждённое ответами устройства).
  private enabled = false;
  private rawPower = 0;

  private heartbeat: ReturnType<typeof setInterval> | null = null;
  private polling = false;
  // Промис-цепочка для сериализации обращений к порту: heartbeat и команды
  // пользователя не должны накладываться (порт обрабатывает один запрос).
  private queue: Promise<unknown> = Promise.resolve();

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
        this.enabled = false;
        this.rawPower = 0;

        // Сразу читаем параметры устройства (Шаг 1 последовательности запуска).
        try {
          await this.getInfo();
        } catch (err) {
          logger.warn('ASE', 'Failed to read info on connect', { path }, err);
        }

        // Транслируем начальное состояние и запускаем периодический опрос,
        // чтобы UI показывал актуальное состояние лазера и мощность.
        this.emitState();
        this.startHeartbeat();
      },
      { path },
    );
  }

  async disconnect(): Promise<void> {
    return logger.withLogging('ASE', 'Disconnect', async () => {
      this.stopHeartbeat();
      await this.port?.close();
      this.port = null;
      this.info = null;
      this.enabled = false;
      this.rawPower = 0;
    });
  }

  /**
   * Прочитать параметры устройства (CMD 0xD1) и закэшировать.
   */
  async getInfo(): Promise<AseInfo> {
    const port = this.requirePort();
    const response = await this.transact(port, buildInfoRequest());
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
    const response = await this.transact(port, buildPowerRequest(raw));
    const { data } = parseResponse(response);

    // Берём подтверждённое устройством сырое значение из эха (если оно есть).
    this.rawPower = data.length >= 2 ? data[0] | (data[1] << 8) : raw;
    this.emitState();

    logger.info('ASE', 'Power set', { mW, raw, coeff: info.coeff });
    return raw;
  }

  /**
   * Включить/выключить излучение (CMD 0xC1).
   */
  async setEnabled(enabled: boolean): Promise<void> {
    const port = this.requirePort();
    const response = await this.transact(port, buildEnableRequest(enabled));
    const { data } = parseResponse(response);

    // Подтверждённое устройством состояние из эха.
    this.enabled = data.length > 0 ? data[0] !== 0x00 : enabled;
    this.emitState();

    logger.info('ASE', 'Emission toggled', { enabled: this.enabled });
  }

  /**
   * Отправить кадр и получить ответ, попутно транслируя в renderer «сырой»
   * поток байтов (tx/rx) для визуального контроля обмена. Обращения к порту
   * сериализуются через очередь, чтобы heartbeat не наложился на команду.
   */
  private transact(port: IAsePort, frame: Buffer): Promise<Buffer> {
    const run = async (): Promise<Buffer> => {
      this.emitTraffic('tx', frame);
      const response = await port.sendCommand(frame);
      this.emitTraffic('rx', response);
      return response;
    };

    const result = this.queue.then(run, run);
    // Хвост очереди не должен «падать» из-за ошибки предыдущей команды.
    this.queue = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }

  private emitTraffic(dir: AseTrafficEvent['dir'], frame: Buffer): void {
    const hex = frame.toString('hex').toUpperCase().match(/.{1,2}/g)?.join(' ') ?? '';
    const event: AseTrafficEvent = { dir, hex, ts: Date.now() };
    this.win.webContents.send(AseIPC.Data, event);
  }

  /** Транслировать актуальное состояние лазера в renderer. */
  private emitState(): void {
    const coeff = this.info?.coeff ?? 1;
    const event: AseStateEvent = {
      enabled: this.enabled,
      rawPower: this.rawPower,
      powerMw: coeff > 0 ? this.rawPower / coeff : this.rawPower,
    };
    this.win.webContents.send(AseIPC.State, event);
  }

  /**
   * Периодический опрос устройства (CMD 0xD1): подтверждает, что связь жива,
   * обновляет параметры и ретранслирует актуальное состояние в UI.
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeat = setInterval(() => {
      // Не накапливаем опросы, если предыдущий ещё не завершился.
      if (this.port === null || this.polling) return;
      this.polling = true;
      this.getInfo()
        .then(() => this.emitState())
        .catch((err) => {
          logger.warn('ASE', 'Heartbeat poll failed', {}, err);
        })
        .finally(() => {
          this.polling = false;
        });
    }, STATE_POLL_INTERVAL);
  }

  private stopHeartbeat(): void {
    if (this.heartbeat !== null) {
      clearInterval(this.heartbeat);
      this.heartbeat = null;
    }
  }

  private requirePort(): IAsePort {
    if (this.port === null || !this.port.isOpen) {
      throw new Error('ASE port is not connected');
    }
    return this.port;
  }

  private handleClosed(path: string): void {
    this.stopHeartbeat();
    this.port = null;
    this.info = null;
    this.enabled = false;
    this.rawPower = 0;
    this.win.webContents.send(AseIPC.Closed, path);
  }

  private handleError(path: string, error: string): void {
    this.win.webContents.send(AseIPC.Error, { port: path, error });
  }
}
