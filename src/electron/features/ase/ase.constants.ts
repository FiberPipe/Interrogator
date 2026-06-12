// src/electron/features/ase/ase.constants.ts

/**
 * Команды протокола ASE.
 */
export const ASE_CMD = {
  INFO: 0xd1, // Получение информации об источнике
  ENABLE: 0xc1, // Включение/выключение излучения (DATA = 01/00)
  POWER: 0xc3, // Установка мощности (DATA = raw_u16 LE)
} as const;

/**
 * Заголовки кадров.
 */
export const TX_HEADER = [0xaa, 0x55] as const; // ПК → ASE
export const RX_HEADER = [0x55, 0xaa] as const; // ASE → ПК

/**
 * Смещения полей в DATA ответа на команду 0xD1.
 */
export const ASE_INFO_OFFSETS = {
  UNIT: 17,
  MAX_SETTING_LSB: 18,
  MAX_SETTING_MSB: 19,
  COEFF: 23,
} as const;

/**
 * Параметры UART-интерфейса источника (8N1, 9600 baud).
 */
export const ASE_SERIAL = {
  baudRate: 9600,
  dataBits: 8 as const,
  parity: 'none' as const,
  stopBits: 1 as const,
};

/**
 * Таймаут ожидания ответа на команду, мс.
 */
export const ASE_RESPONSE_TIMEOUT = 1000;

/**
 * Параметры эмулируемого устройства по умолчанию.
 * coeff = 100, max_setting = 20 → raw_max = 2000 (соответствует примеру из ТЗ).
 */
export const ASE_MOCK_DEVICE = {
  unit: 0,
  maxSetting: 20,
  coeff: 100,
  /** Длина DATA в ответе на 0xD1: нужно покрыть смещение coeff (23). */
  infoPayloadLength: 24,
  /** Имитация задержки ответа устройства, мс. */
  responseDelay: 15,
} as const;
