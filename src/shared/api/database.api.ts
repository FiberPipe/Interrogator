// src/shared/api/database.api.ts

import type {
  DatabasePathInfo,
  DatabaseLocation,
  DatabaseChangeLocationResult,
  DatabaseStats,
  ChannelStats,
  ChannelStatsWithId,
  SensorDataRecord,
  DatabaseBackupResult,
  DatabaseExportOptions,
  DatabaseExportResult,
} from '../types/database.types';

/**
 * Проверка доступности database API
 */
const isDatabaseAvailable = (): boolean => {
  return typeof window !== 'undefined' && window?.electron.database !== undefined;
};

export const databaseApi = {
  /**
   * Получить путь к БД
   */
  async getPath(): Promise<DatabasePathInfo | null> {
    if (!isDatabaseAvailable()) {
      console.error('Database API is not available');
      return null;
    }
    return window.electron.database.getPath();
  },

  /**
   * Изменить местоположение БД
   */
  async changeLocation(
    location: DatabaseLocation,
    customPath?: string,
  ): Promise<DatabaseChangeLocationResult> {
    if (!isDatabaseAvailable()) {
      console.error('Database API is not available');
      return { success: false, error: 'API not available' };
    }
    return window.electron.database.changeLocation(location, customPath);
  },

  /**
   * Выбрать кастомный путь
   */
  async selectCustomPath(): Promise<string | null> {
    if (!isDatabaseAvailable()) {
      console.error('Database API is not available');
      return null;
    }
    return window.electron.database.selectCustomPath();
  },

  /**
   * Открыть папку с БД
   */
  async openFolder(): Promise<string | null> {
    if (!isDatabaseAvailable()) {
      console.error('Database API is not available');
      return null;
    }
    return window.electron.database.openFolder();
  },

  /**
   * Получить статистику БД
   */
  async getStats(): Promise<DatabaseStats | null> {
    if (!isDatabaseAvailable()) {
      console.error('Database API is not available');
      return null;
    }
    return window.electron.database.getStats();
  },

  /**
   * Получить статистику канала
   */
  async getChannelStats(
    port: string,
    channel: number,
    startTime: number,
    endTime: number,
  ): Promise<ChannelStats | null> {
    if (!isDatabaseAvailable()) {
      console.error('Database API is not available');
      return null;
    }
    return window.electron.database.getChannelStats(port, channel, startTime, endTime);
  },

  /**
   * Получить статистику по всем каналам за период
   */
  async getChannelStatsAll(
    port: string,
    startTime: number,
    endTime: number,
  ): Promise<ChannelStatsWithId[]> {
    if (!isDatabaseAvailable()) {
      console.error('Database API is not available');
      return [];
    }
    return window.electron.database.getChannelStatsAll(port, startTime, endTime);
  },

  /**
   * Получить данные за период времени
   */
  async getDataByTimeRange(
    port: string,
    startTime: number,
    endTime: number,
    limit?: number,
  ): Promise<SensorDataRecord[]> {
    if (!isDatabaseAvailable()) {
      console.error('Database API is not available');
      return [];
    }
    return window.electron.database.getDataByTimeRange(port, startTime, endTime, limit);
  },

  /**
   * Получить последние N записей
   */
  async getLastRecords(port: string, limit?: number): Promise<SensorDataRecord[]> {
    if (!isDatabaseAvailable()) {
      console.error('Database API is not available');
      return [];
    }
    return window.electron.database.getLastRecords(port, limit);
  },

  /**
   * Создать резервную копию
   */
  async createBackup(): Promise<DatabaseBackupResult> {
    if (!isDatabaseAvailable()) {
      console.error('Database API is not available');
      return { success: false, error: 'API not available' };
    }
    return window.electron.database.createBackup();
  },

  /**
   * Восстановить из резервной копии
   */
  async restoreBackup(): Promise<DatabaseBackupResult> {
    if (!isDatabaseAvailable()) {
      console.error('Database API is not available');
      return { success: false, error: 'API not available' };
    }
    return window.electron.database.restoreBackup();
  },

  /**
   * Экспортировать данные
   */
  async exportData(options: DatabaseExportOptions): Promise<DatabaseExportResult> {
    if (!isDatabaseAvailable()) {
      console.error('Database API is not available');
      return { success: false, error: 'API not available' };
    }
    return window.electron.database.exportData(options);
  },

  /**
   * Выполнить VACUUM
   */
  async vacuum(): Promise<{ success: boolean; error?: string }> {
    if (!isDatabaseAvailable()) {
      console.error('Database API is not available');
      return { success: false, error: 'API not available' };
    }
    return window.electron.database.vacuum();
  },

  /**
   * Очистить все данные
   */
  async clear(): Promise<{ success: boolean; error?: string }> {
    if (!isDatabaseAvailable()) {
      console.error('Database API is not available');
      return { success: false, error: 'API not available' };
    }
    return window.electron.database.clear();
  },
};
