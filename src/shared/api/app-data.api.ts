// src/shared/api/app-data.api.ts

import type { AppSettings } from '../types/app-data.types';

/**
 * Проверка доступности appData API
 */
const isAppDataAvailable = (): boolean => {
  return typeof window !== 'undefined' && window?.electron.appData !== undefined;
};

export const appDataApi = {
  /**
   * Получить значение
   */
  async get<T = unknown>(key: string): Promise<T | undefined> {
    if (!isAppDataAvailable()) {
      console.error('AppData API is not available');
      return undefined;
    }
    return window.electron.appData.get<T>(key);
  },

  async getAll(): Promise<AppSettings> {
    if (!isAppDataAvailable()) {
      console.error('AppData API is not available');
      return {};
    }
    return window.electron.appData.getAll();
  },

  /**
   * Установить значение
   */
  async set<T = unknown>(key: string, value: T): Promise<void> {
    if (!isAppDataAvailable()) {
      console.error('AppData API is not available');
      return;
    }
    return window.electron.appData.set(key, value);
  },

  /**
   * Удалить значение
   */
  async delete(key: string): Promise<void> {
    if (!isAppDataAvailable()) {
      console.error('AppData API is not available');
      return;
    }
    return window.electron.appData.delete(key);
  },

  /**
   * Проверить наличие ключа
   */
  async has(key: string): Promise<boolean> {
    if (!isAppDataAvailable()) {
      console.error('AppData API is not available');
      return false;
    }
    return window.electron.appData.has(key);
  },

  /**
   * Очистить все данные
   */
  async clear(): Promise<void> {
    if (!isAppDataAvailable()) {
      console.error('AppData API is not available');
      return;
    }
    return window.electron.appData.clear();
  },

  async patch(patch: Record<string, unknown>): Promise<AppSettings> {
    if (!isAppDataAvailable()) {
      console.error('AppData API is not available');
      return {};
    }
    return window.electron.appData.patch(patch);
  },
};
