// src/electron/features/ase/services/mock-ase-port.service.ts
//
// In-process эмулятор COM-порта ASE: реализует тот же интерфейс, что и
// реальный AsePort, но вместо физического порта прогоняет кадры через
// AseDevice. Включается флагом WITH_MOCK_PORTS — позволяет тестировать
// весь UI без оборудования и виртуальных COM-портов.

import { AseDevice } from '../ase.device';
import type { AseDeviceConfig } from '../ase.device';
import { ASE_MOCK_DEVICE } from '../ase.constants';
import type { AsePortClosedHandler, AsePortErrorHandler, IAsePort } from '../ase.types';
import { logger } from '../../logger';

export class MockAsePort implements IAsePort {
  private open_ = false;
  private readonly device: AseDevice;

  constructor(
    readonly path: string,
    private readonly onClosed: AsePortClosedHandler,
    private readonly onError: AsePortErrorHandler,
    deviceConfig?: Partial<AseDeviceConfig>,
  ) {
    this.device = new AseDevice(deviceConfig);
  }

  get isOpen(): boolean {
    return this.open_;
  }

  async open(): Promise<void> {
    this.open_ = true;
    logger.info('ASE', 'Mock port opened', { path: this.path });
  }

  /**
   * Прогнать кадр запроса через эмулятор устройства и вернуть кадр ответа.
   */
  async sendCommand(frame: Buffer): Promise<Buffer> {
    if (!this.open_) {
      throw new Error('Mock ASE port is not open');
    }

    // Имитация задержки реального устройства.
    await new Promise((resolve) => setTimeout(resolve, ASE_MOCK_DEVICE.responseDelay));

    try {
      return this.device.handleFrame(frame);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.onError(this.path, message);
      throw err;
    }
  }

  async close(): Promise<void> {
    if (!this.open_) return;
    this.open_ = false;
    logger.info('ASE', 'Mock port closed', { path: this.path });
    this.onClosed(this.path);
  }
}
