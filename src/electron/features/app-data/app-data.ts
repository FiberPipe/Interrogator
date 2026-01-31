// src/electron/features/app-data/app-data.ts

import Store from 'electron-store';

import type { IAppDataStorage, AppDataStorageConfig } from './app-data.types';
import { DEFAULT_SETTINGS, PROTECTED_KEYS } from './app-data.constants';
import { logger } from '../logger';
import type { AppSettings } from '../../../shared/types/app-data.types';

export class AppDataStorage implements IAppDataStorage {
  private static instance: AppDataStorage;
  private store: Store<AppSettings>;

  private constructor(config: AppDataStorageConfig = {}) {
    this.store = new Store<AppSettings>({
      name: config.name ?? 'app-settings',
      encryptionKey: config.encryptionKey,
      defaults: { ...DEFAULT_SETTINGS, ...config.defaults },
    });

    logger.debug('Storage', 'AppDataStorage initialized', {
      storePath: this.store.path,
      size: this.store.size,
    });
  }

  static getInstance(config?: AppDataStorageConfig): AppDataStorage {
    if (!AppDataStorage.instance) {
      AppDataStorage.instance = new AppDataStorage(config);
    }
    return AppDataStorage.instance;
  }

  /**
   * Получить значение по ключу
   */
  get<T = unknown>(key: string): T | undefined {
    try {
      const value = this.store.get(key) as T | undefined;

      logger.debug('Storage', 'Get value', {
        key,
        exists: value !== undefined,
      });

      return value;
    } catch (err) {
      logger.error('Storage', 'Failed to get value', { key }, err);
      return undefined;
    }
  }

  /**
   * Установить значение
   */
  set(key: string, value: unknown): void {
    try {
      this.store.set(key, value);

      logger.debug('Storage', 'Set value', {
        key,
        valueType: typeof value,
      });
    } catch (err) {
      logger.error('Storage', 'Failed to set value', { key }, err);
      throw err;
    }
  }

  /**
   * Удалить значение
   */
  delete(key: string): void {
    try {
      // Проверка защищенных ключей
      if (PROTECTED_KEYS.includes(key)) {
        logger.warn('Storage', 'Attempt to delete protected key', { key });
        throw new Error(`Cannot delete protected key: ${key}`);
      }

      this.store.delete(key);

      logger.debug('Storage', 'Delete value', { key });
    } catch (err) {
      logger.error('Storage', 'Failed to delete value', { key }, err);
      throw err;
    }
  }

  /**
   * Получить все настройки
   */
  getAll(): AppSettings {
    try {
      const settings = this.store.store as AppSettings;

      logger.debug('Storage', 'Get all settings', {
        keysCount: Object.keys(settings).length,
      });

      return settings;
    } catch (err) {
      logger.error('Storage', 'Failed to get all settings', {}, err);
      return {} as AppSettings;
    }
  }

  /**
   * Обновить несколько значений
   */
  patch(patch: Record<string, unknown>): AppSettings {
    try {
      Object.entries(patch).forEach(([key, value]) => {
        this.store.set(key, value);
      });

      const updatedSettings = this.store.store as AppSettings;

      logger.info('Storage', 'Patched settings', {
        patchedKeys: Object.keys(patch),
        totalKeys: Object.keys(updatedSettings).length,
      });

      return updatedSettings;
    } catch (err) {
      logger.error('Storage', 'Failed to patch settings', { patch }, err);
      throw err;
    }
  }

  /**
   * Очистить все настройки
   */
  clear(): void {
    try {
      this.store.clear();

      logger.warn('Storage', 'All settings cleared');
    } catch (err) {
      logger.error('Storage', 'Failed to clear settings', {}, err);
      throw err;
    }
  }

  /**
   * Проверить существование ключа
   */
  has(key: string): boolean {
    try {
      const exists = this.store.has(key);

      logger.debug('Storage', 'Check key existence', { key, exists });

      return exists;
    } catch (err) {
      logger.error('Storage', 'Failed to check key existence', { key }, err);
      return false;
    }
  }

  /**
   * Получить путь к файлу хранилища
   */
  getStorePath(): string {
    return this.store.path;
  }

  /**
   * Получить размер хранилища (количество ключей)
   */
  getSize(): number {
    return this.store.size;
  }

  /**
   * Сбросить настройки к дефолтным значениям
   */
  reset(): void {
    try {
      this.store.clear();

      logger.warn('Storage', 'Settings reset to defaults');
    } catch (err) {
      logger.error('Storage', 'Failed to reset settings', {}, err);
      throw err;
    }
  }
}

export const appDataStorage = AppDataStorage.getInstance();
