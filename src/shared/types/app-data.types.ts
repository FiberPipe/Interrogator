// src/shared/types/app-data.types.ts

/**
 * Настройки приложения
 */
export interface AppSettings {
  lastPort?: string;
  baudRate?: number;
  autoConnect?: boolean;
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  logsRetentionDays?: number;
  chartRefreshInterval?: number;
  [key: string]: unknown;
}

/**
 * API для работы с app-data (Renderer Process)
 */
export interface AppDataAPI {
  /**
   * Получить все настройки
   */
  getAll: () => Promise<AppSettings>;

  /**
   * Получить значение по ключу
   */
  get: <T = unknown>(key: string) => Promise<T | undefined>;

  /**
   * Установить значение
   */
  set: (key: string, value: unknown) => Promise<void>;

  /**
   * Удалить значение
   */
  delete: (key: string) => Promise<void>;

  /**
   * Обновить несколько значений
   */
  patch: (patch: Record<string, unknown>) => Promise<AppSettings>;

  /**
   * Очистить все настройки
   */
  clear: () => Promise<void>;

  /**
   * Проверить существование ключа
   */
  has: (key: string) => Promise<boolean>;
}
