// src/shared/types/database.types.ts
import type { Database as SqlJsDatabase } from 'sql.js';

/**
 * Информация о пути к базе данных
 */
export interface DatabasePathInfo {
  path: string;
  exists: boolean;
  size: number;
  sizeFormatted: string;
  userDataPath: string;
  config: {
    location: DatabaseLocation;
    customPath?: string;
    filename: string;
  };
  allPossiblePaths: Record<DatabaseLocation, string>;
}

/**
 * Результат изменения местоположения БД
 */
export interface DatabaseChangeLocationResult {
  success: boolean;
  path?: string;
  error?: string;
}

/**
 * Статистика базы данных
 */
export interface DatabaseStats {
  totalSessions: number;
  totalRecords: number;
  totalSize: number;
  totalSizeFormatted: string;
  activeSessions: number;
  sessions: SessionRecord[];
}

/**
 * Статистика канала
 */
export interface ChannelStats {
  count: number;
  min: number;
  max: number;
  avg: number;
}

/**
 * Запись данных сенсора
 */
export interface SensorDataRecord {
  id: number;
  record_id: string;
  timestamp: number;
  time: string;
  port: string;
  raw_data: string;
  created_at: number;
}

/**
 * Запись сессии
 */
export interface SessionRecord {
  id: number;
  port: string;
  start_time: number;
  end_time?: number;
  record_count: number;
  status: 'active' | 'stopped' | 'error';
}

/**
 * Результат операции с бэкапом
 */
export interface DatabaseBackupResult {
  success: boolean;
  path?: string;
  cancelled?: boolean;
  error?: string;
}

/**
 * Опции экспорта данных
 */
export interface DatabaseExportOptions {
  format: 'csv' | 'json' | 'sql';
  timeRange?: string;
  startTime?: number;
  endTime?: number;
}

/**
 * Результат экспорта данных
 */
export interface DatabaseExportResult {
  success: boolean;
  path?: string;
  cancelled?: boolean;
  error?: string;
}

/**
 * Статистика канала с его номером (для агрегации по всем каналам).
 */
export interface ChannelStatsWithId extends ChannelStats {
  channel: number;
}

export enum DatabaseIPC {
  // Path & Config
  GetPath = 'db:getPath',
  ChangeLocation = 'db:changeLocation',
  SelectCustomPath = 'db:selectCustomPath',
  OpenFolder = 'db:openFolder',

  // Statistics
  GetStats = 'db:getStats',
  GetChannelStats = 'db:getChannelStats',
  GetChannelStatsAll = 'db:getChannelStatsAll',

  // Data Queries
  GetDataByTimeRange = 'db:getDataByTimeRange',
  GetLastRecords = 'db:getLastRecords',

  // Backup & Restore
  CreateBackup = 'db:createBackup',
  RestoreBackup = 'db:restoreBackup',

  // Export
  ExportData = 'db:exportData',

  // Maintenance
  Vacuum = 'db:vacuum',
  Clear = 'db:clear',
}

/**
 * Типы расположения базы данных
 */
export type DatabaseLocation = 'userData' | 'appPath' | 'documents' | 'custom';

/**
 * Конфигурация базы данных
 */
export interface DatabaseConfig {
  location: DatabaseLocation;
  customPath?: string;
  filename: string;
}

/**
 * Информация о пути к базе данных
 */
export interface DatabasePathInfo {
  path: string;
  exists: boolean;
  size: number;
  sizeFormatted: string;
  userDataPath: string;
  config: DatabaseConfig;
  allPossiblePaths: Record<DatabaseLocation, string>;
}

/**
 * Результат изменения местоположения БД
 */
export interface DatabaseChangeLocationResult {
  success: boolean;
  path?: string;
  error?: string;
}

/**
 * Статистика базы данных
 */
export interface DatabaseStats {
  totalSessions: number;
  totalRecords: number;
  totalSize: number;
  totalSizeFormatted: string;
  activeSessions: number;
  sessions: SessionRecord[];
}

/**
 * Статистика канала
 */
export interface ChannelStats {
  count: number;
  min: number;
  max: number;
  avg: number;
}

/**
 * Запись данных сенсора
 */
export interface SensorDataRecord {
  id: number;
  record_id: string;
  timestamp: number;
  time: string;
  port: string;
  raw_data: string;
  created_at: number;
}

/**
 * Запись канала
 */
export interface ChannelRecord {
  channel: number;
  value: number;
  //@ts-ignore
  stdDev?: number;
}

/**
 * Запись сессии
 */
export interface SessionRecord {
  id: number;
  port: string;
  start_time: number;
  end_time?: number;
  record_count: number;
  status: 'active' | 'stopped' | 'error';
}

/**
 * Результат операции с бэкапом
 */
export interface DatabaseBackupResult {
  success: boolean;
  path?: string;
  cancelled?: boolean;
  error?: string;
}

/**
 * Опции экспорта данных
 */
export interface DatabaseExportOptions {
  format: 'csv' | 'json' | 'sql';
  timeRange?: string;
  startTime?: number;
  endTime?: number;
}

/**
 * Результат экспорта данных
 */
export interface DatabaseExportResult {
  success: boolean;
  path?: string;
  cancelled?: boolean;
  error?: string;
}

/**
 * Результат операции очистки
 */
export interface DatabaseClearResult {
  success: boolean;
  error?: string;
}

/**
 * Интерфейс для работы с базой данных (Main Process)
 */
export interface IDatabase {
  getDatabase(): SqlJsDatabase;
  saveDatabase(): void;
  exportDatabase(exportPath: string): boolean;
  importDatabase(importPath: string): Promise<boolean>;
  shutdown(): Promise<void>;
}

export interface ChannelStats {
  count: number;
  min: number;
  max: number;
  avg: number;
}

/**
 * Запись канала с нормализацией
 */
export interface ChannelRecord {
  channel: number;
  value: number;
  //@ts-ignore
  stdDev: number;
}

/**
 * Запись сессии
 */
export interface SessionRecord {
  id: number;
  port: string;
  start_time: number;
  end_time?: number;
  record_count: number;
  status: 'active' | 'stopped' | 'error';
}
