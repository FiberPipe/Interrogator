// src/electron/features/database/database.constants.ts

import type { DatabaseConfig } from './database.types';

export const FEATURE_NAME = 'DATABASE';

/**
 * Настройки базы данных
 */
export const DATABASE_SETTINGS = {
  DEFAULT_FILENAME: 'sensor-data.db',
  MAX_SIZE: 100 * 1024 * 1024, // 100 MB
  AUTO_SAVE_INTERVAL_WINDOWS: 15000, // 15 сек для Windows
  AUTO_SAVE_INTERVAL_OTHER: 10000, // 10 сек для других ОС
} as const;

/**
 * Настройки оптимизации SQLite
 */
export const SQLITE_PRAGMAS = {
  JOURNAL_MODE: 'MEMORY',
  SYNCHRONOUS: 'OFF',
  CACHE_SIZE: 10000,
  TEMP_STORE: 'MEMORY',
} as const;

/**
 * Названия таблиц
 */
export const TABLE_NAMES = {
  SENSOR_DATA: 'sensor_data',
  CHANNEL_DATA: 'channel_data',
  SESSIONS: 'sessions',
  LOGS: 'logs',
} as const;

/**
 * Дефолтная конфигурация
 */
export const DEFAULT_DATABASE_CONFIG: DatabaseConfig = {
  location: 'userData',
  filename: DATABASE_SETTINGS.DEFAULT_FILENAME,
};
