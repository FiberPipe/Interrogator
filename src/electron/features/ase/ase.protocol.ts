// src/electron/features/ase/ase.protocol.ts
//
// Чистая логика бинарного протокола управления ASE-источником
// Connet VASS C-M-100-1-FA. Без I/O — легко тестируется.
//
// Формат команды ПК → ASE: AA 55 CMD LEN DATA... CRC_L CRC_H
// Формат ответа ASE → ПК:  55 AA CMD LEN DATA... CRC_L CRC_H
// CRC = sum(DATA) & 0xFFFF, передаётся little-endian.

import { ASE_CMD, ASE_INFO_OFFSETS, RX_HEADER, TX_HEADER } from './ase.constants';
import type { AseInfo } from './ase.types';

/**
 * Контрольная сумма: простая сумма байтов данных, обрезанная до 16 бит.
 */
export function crc(data: readonly number[]): number {
  return data.reduce((sum, b) => sum + b, 0) & 0xffff;
}

/**
 * Собрать кадр с указанным заголовком.
 */
function frameWith(
  header: readonly number[],
  cmd: number,
  data: readonly number[],
): Buffer {
  const checksum = crc(data);
  return Buffer.from([
    ...header,
    cmd,
    data.length,
    ...data,
    checksum & 0xff,
    (checksum >> 8) & 0xff,
  ]);
}

/**
 * Собрать кадр команды ПК → ASE (заголовок AA 55).
 */
export function buildFrame(cmd: number, data: readonly number[] = []): Buffer {
  return frameWith(TX_HEADER, cmd, data);
}

/**
 * Собрать кадр ответа ASE → ПК (заголовок 55 AA) — используется эмулятором.
 */
export function buildResponseFrame(cmd: number, data: readonly number[] = []): Buffer {
  return frameWith(RX_HEADER, cmd, data);
}

/**
 * Разобрать кадр запроса ПК → ASE (заголовок AA 55) — используется эмулятором.
 */
export function parseRequest(buffer: Buffer): ParsedResponse {
  if (buffer.length < RESPONSE_OVERHEAD) {
    throw new Error(`Request too short: ${buffer.length} bytes`);
  }

  if (buffer[0] !== TX_HEADER[0] || buffer[1] !== TX_HEADER[1]) {
    throw new Error(
      `Invalid request header: ${buffer[0].toString(16)} ${buffer[1].toString(16)}`,
    );
  }

  const cmd = buffer[2];
  const len = buffer[3];
  const data = buffer.subarray(4, 4 + len);

  return { cmd, data };
}

/**
 * Минимальная длина полного кадра ответа (заголовок + cmd + len + 2 байта CRC).
 */
export const RESPONSE_OVERHEAD = TX_HEADER.length + 2 + 2;

/**
 * Сколько всего байт должен занимать кадр ответа с полем DATA длины len.
 */
export function expectedResponseLength(len: number): number {
  return RX_HEADER.length + 2 + len + 2;
}

/**
 * Результат разбора кадра ответа.
 */
export interface ParsedResponse {
  cmd: number;
  data: Buffer;
}

/**
 * Разобрать кадр ответа ASE → ПК.
 * Бросает ошибку при несовпадении заголовка/CRC или неполном кадре.
 */
export function parseResponse(buffer: Buffer): ParsedResponse {
  if (buffer.length < RESPONSE_OVERHEAD) {
    throw new Error(`Response too short: ${buffer.length} bytes`);
  }

  if (buffer[0] !== RX_HEADER[0] || buffer[1] !== RX_HEADER[1]) {
    throw new Error(
      `Invalid response header: ${buffer[0].toString(16)} ${buffer[1].toString(16)}`,
    );
  }

  const cmd = buffer[2];
  const len = buffer[3];
  const total = expectedResponseLength(len);

  if (buffer.length < total) {
    throw new Error(`Incomplete response: expected ${total}, got ${buffer.length}`);
  }

  const data = buffer.subarray(4, 4 + len);
  const expectedCrc = buffer[4 + len] | (buffer[5 + len] << 8);
  const actualCrc = crc([...data]);

  if (expectedCrc !== actualCrc) {
    throw new Error(
      `CRC mismatch: expected ${expectedCrc.toString(16)}, got ${actualCrc.toString(16)}`,
    );
  }

  return { cmd, data };
}

/**
 * Извлечь параметры устройства из DATA ответа на команду 0xD1.
 */
export function parseInfo(payload: Buffer): AseInfo {
  if (payload.length <= ASE_INFO_OFFSETS.COEFF) {
    throw new Error(`Info payload too short: ${payload.length} bytes`);
  }

  const unit = payload[ASE_INFO_OFFSETS.UNIT];
  const maxSetting =
    payload[ASE_INFO_OFFSETS.MAX_SETTING_LSB] + 256 * payload[ASE_INFO_OFFSETS.MAX_SETTING_MSB];

  // По протоколу: если coeff == 0, считаем coeff = 1.
  const coeff = payload[ASE_INFO_OFFSETS.COEFF] || 1;

  return { unit, maxSetting, coeff };
}

/**
 * Перевести требуемую мощность (mW) в сырое значение для команды 0xC3,
 * с ограничением по максимуму: raw_max = max_setting * coeff.
 */
export function mwToRaw(mW: number, info: Pick<AseInfo, 'coeff' | 'maxSetting'>): number {
  const raw = Math.round(mW * info.coeff);
  const rawMax = info.maxSetting * info.coeff;
  return Math.max(0, Math.min(raw, rawMax));
}

/**
 * Кадр запроса параметров устройства (CMD 0xD1, DATA пустой).
 */
export function buildInfoRequest(): Buffer {
  return buildFrame(ASE_CMD.INFO);
}

/**
 * Кадр включения/выключения излучения (CMD 0xC1, DATA = 01/00).
 */
export function buildEnableRequest(enabled: boolean): Buffer {
  return buildFrame(ASE_CMD.ENABLE, [enabled ? 0x01 : 0x00]);
}

/**
 * Кадр установки мощности (CMD 0xC3, DATA = raw_u16 little-endian).
 */
export function buildPowerRequest(raw: number): Buffer {
  const value = Math.max(0, Math.min(raw, 0xffff));
  return buildFrame(ASE_CMD.POWER, [value & 0xff, (value >> 8) & 0xff]);
}
