// src/electron/features/serial/serial.constants.ts

import type { SerialConfig } from './serial.types';

export const FEATURE_NAME = 'SERIAL';

/**
 * Настройки Serial по умолчанию
 */
export const DEFAULT_SERIAL_CONFIG: SerialConfig = {
  defaultBaudRate: 500000,
  autoConnect: false,
  useMockPorts: false,
};

/**
 * Поддерживаемые скорости передачи
 */
export const SUPPORTED_BAUD_RATES = [
  9600, 19200, 38400, 57600, 500000, 230400, 460800, 921600,
] as const;

/**
 * Таймауты
 */
export const TIMEOUTS = {
  CLOSE_PORT: 5000, // 5 секунд на закрытие порта
  SWITCH_DELAY: 200, // 200мс задержка между переключениями
  MOCK_DATA_INTERVAL: 1000, // 1 секунда между отправкой mock данных
  MOCK_INIT_DELAY: 200, // 200мс перед началом отправки mock данных
} as const;

/**
 * Настройки обработки данных
 */
export const DATA_PROCESSING = {
  CHANNELS_COUNT: 16, // Количество каналов
  MIN_CHANNELS_FOR_WAVELENGTH: 2, // Минимум каналов для расчета wavelength
  SAVE_INTERVAL: 5000, // 5 секунд между сохранениями в БД
} as const;

/**
 * Mock порты для разработки
 */
export const MOCK_PORTS = [
  {
    path: '/dev/ttyUSB0',
    manufacturer: 'FTDI (Mock)',
    serialNumber: 'MOCK001',
    vendorId: '0403',
    productId: '6001',
  },
  {
    path: '/dev/ttyUSB1',
    manufacturer: 'FTDI (Mock)',
    serialNumber: 'MOCK002',
    vendorId: '0403',
    productId: '6001',
  },
  {
    path: '/dev/ttyUSB2',
    manufacturer: 'FTDI (Mock)',
    serialNumber: 'MOCK003',
    vendorId: '0403',
    productId: '6001',
  },
] as const;

/**
 * Ключи для хранения настроек
 */
export const STORAGE_KEYS = {
  LAST_PORT: 'lastPort',
  BAUD_RATE: 'baudRate',
  CALIBRATION_DATA: 'calibrationData',
  SENSOR_CONFIG: 'sensorConfig',
  SENSOR_COUNT: 'sensorCount',
  AVG_SEC: 'avgSec',
} as const;

/**
 * Параметры усреднения по времени.
 */
export const AVERAGING = {
  DEFAULT_AVG_SEC: 1.0,
  MIN_AVG_SEC: 0.1,
  MAX_AVG_SEC: 30.0,
} as const;
