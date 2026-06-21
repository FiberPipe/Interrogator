// src/electron/features/database/database.api.ts

import { ipcRenderer } from 'electron';

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
  DatabaseClearResult,
} from './database.types';
import { DatabaseIPC } from './database.types';
import type { DatabaseAPI } from '../../../shared/types/database.types';

export const databaseAPI: DatabaseAPI = {
  /**
   * Получить путь к БД
   */
  getPath(): Promise<DatabasePathInfo> {
    return ipcRenderer.invoke(DatabaseIPC.GetPath);
  },

  /**
   * Изменить местоположение БД
   */
  changeLocation(
    location: DatabaseLocation,
    customPath?: string,
  ): Promise<DatabaseChangeLocationResult> {
    return ipcRenderer.invoke(DatabaseIPC.ChangeLocation, location, customPath);
  },

  /**
   * Выбрать кастомный путь
   */
  selectCustomPath(): Promise<string | null> {
    return ipcRenderer.invoke(DatabaseIPC.SelectCustomPath);
  },

  /**
   * Открыть папку с БД
   */
  openFolder(): Promise<string> {
    return ipcRenderer.invoke(DatabaseIPC.OpenFolder);
  },

  /**
   * Получить статистику БД
   */
  getStats(): Promise<DatabaseStats> {
    return ipcRenderer.invoke(DatabaseIPC.GetStats);
  },

  /**
   * Получить статистику канала
   */
  getChannelStats(
    port: string,
    channel: number,
    startTime: number,
    endTime: number,
  ): Promise<ChannelStats> {
    return ipcRenderer.invoke(DatabaseIPC.GetChannelStats, port, channel, startTime, endTime);
  },

  /**
   * Получить статистику по всем каналам за период
   */
  getChannelStatsAll(
    port: string,
    startTime: number,
    endTime: number,
  ): Promise<ChannelStatsWithId[]> {
    return ipcRenderer.invoke(DatabaseIPC.GetChannelStatsAll, port, startTime, endTime);
  },

  /**
   * Получить данные за период времени
   */
  getDataByTimeRange(
    port: string,
    startTime: number,
    endTime: number,
    limit?: number,
  ): Promise<SensorDataRecord[]> {
    return ipcRenderer.invoke(DatabaseIPC.GetDataByTimeRange, port, startTime, endTime, limit);
  },

  /**
   * Получить последние N записей
   */
  getLastRecords(port: string, limit?: number): Promise<SensorDataRecord[]> {
    return ipcRenderer.invoke(DatabaseIPC.GetLastRecords, port, limit);
  },

  /**
   * Создать резервную копию
   */
  createBackup(): Promise<DatabaseBackupResult> {
    return ipcRenderer.invoke(DatabaseIPC.CreateBackup);
  },

  /**
   * Восстановить из резервной копии
   */
  restoreBackup(): Promise<DatabaseBackupResult> {
    return ipcRenderer.invoke(DatabaseIPC.RestoreBackup);
  },

  /**
   * Экспортировать данные
   */
  exportData(options: DatabaseExportOptions): Promise<DatabaseExportResult> {
    return ipcRenderer.invoke(DatabaseIPC.ExportData, options);
  },

  /**
   * Выполнить VACUUM
   */
  vacuum(): Promise<DatabaseClearResult> {
    return ipcRenderer.invoke(DatabaseIPC.Vacuum);
  },

  /**
   * Очистить все данные
   */
  clear(): Promise<DatabaseClearResult> {
    return ipcRenderer.invoke(DatabaseIPC.Clear);
  },
};
