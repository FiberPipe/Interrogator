// src/electron/features/app-data/app-data.constants.ts

import type { AppSettings } from '../../../shared/types/app-data.types';

export const FEATURE_NAME = 'APP_DATA_STORAGE';

/**
 * Дефолтные настройки приложения
 */
export const DEFAULT_SETTINGS: Partial<AppSettings> = {
  baudRate: 500000,
  autoConnect: false,
  theme: 'system',
  language: 'en',
  logsRetentionDays: 7,
  chartRefreshInterval: 1000,
};

/**
 * Ключи настроек, которые нельзя удалять
 */
export const PROTECTED_KEYS: readonly string[] = ['theme', 'language'] as const;
