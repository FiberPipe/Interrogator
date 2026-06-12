// src/electron/features/ase/ase.device.ts
//
// Эмулятор ASE-источника (логика «прошивки» платы).
// Принимает кадры запроса ПК → ASE и формирует кадры ответа ASE → ПК
// по тому же протоколу, что и реальное устройство. Без какого-либо I/O —
// чистая логика, пригодная для unit-тестов и in-process mock-порта.

import { ASE_CMD, ASE_INFO_OFFSETS, ASE_MOCK_DEVICE } from './ase.constants';
import { buildResponseFrame, parseRequest } from './ase.protocol';

export interface AseDeviceConfig {
  unit: number;
  maxSetting: number;
  coeff: number;
}

export interface AseDeviceState {
  enabled: boolean;
  rawPower: number;
}

export class AseDevice {
  private readonly config: AseDeviceConfig;
  private enabled = false;
  private rawPower = 0;

  constructor(config?: Partial<AseDeviceConfig>) {
    this.config = {
      unit: config?.unit ?? ASE_MOCK_DEVICE.unit,
      maxSetting: config?.maxSetting ?? ASE_MOCK_DEVICE.maxSetting,
      coeff: config?.coeff ?? ASE_MOCK_DEVICE.coeff,
    };
  }

  getState(): AseDeviceState {
    return { enabled: this.enabled, rawPower: this.rawPower };
  }

  /**
   * Обработать кадр запроса и вернуть кадр ответа.
   */
  handleFrame(request: Buffer): Buffer {
    const { cmd, data } = parseRequest(request);

    switch (cmd) {
      case ASE_CMD.INFO:
        return this.handleInfo();
      case ASE_CMD.ENABLE:
        return this.handleEnable(data);
      case ASE_CMD.POWER:
        return this.handlePower(data);
      default:
        // Неизвестная команда — эхо без данных.
        return buildResponseFrame(cmd, []);
    }
  }

  /**
   * 0xD1 — отдать массив параметров устройства.
   */
  private handleInfo(): Buffer {
    const payload = new Array<number>(ASE_MOCK_DEVICE.infoPayloadLength).fill(0);

    payload[ASE_INFO_OFFSETS.UNIT] = this.config.unit & 0xff;
    payload[ASE_INFO_OFFSETS.MAX_SETTING_LSB] = this.config.maxSetting & 0xff;
    payload[ASE_INFO_OFFSETS.MAX_SETTING_MSB] = (this.config.maxSetting >> 8) & 0xff;
    payload[ASE_INFO_OFFSETS.COEFF] = this.config.coeff & 0xff;

    return buildResponseFrame(ASE_CMD.INFO, payload);
  }

  /**
   * 0xC1 — включить/выключить излучение (DATA = 01/00), эхо в ответе.
   */
  private handleEnable(data: Buffer): Buffer {
    this.enabled = data.length > 0 && data[0] !== 0x00;
    return buildResponseFrame(ASE_CMD.ENABLE, [this.enabled ? 0x01 : 0x00]);
  }

  /**
   * 0xC3 — установить мощность (DATA = raw_u16 LE) с ограничением raw_max.
   */
  private handlePower(data: Buffer): Buffer {
    const raw = data.length >= 2 ? data[0] | (data[1] << 8) : 0;
    const rawMax = this.config.maxSetting * this.config.coeff;
    this.rawPower = Math.max(0, Math.min(raw, rawMax));

    return buildResponseFrame(ASE_CMD.POWER, [
      this.rawPower & 0xff,
      (this.rawPower >> 8) & 0xff,
    ]);
  }
}
