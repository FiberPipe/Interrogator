// src/shared/types/database.types.ts

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
 * API для работы с базой данных (Renderer Process)
 */
export interface DatabaseAPI {
  getPath: () => Promise<DatabasePathInfo>;
  changeLocation: (
    location: DatabaseLocation,
    customPath?: string,
  ) => Promise<DatabaseChangeLocationResult>;
  selectCustomPath: () => Promise<string | null>;
  openFolder: () => Promise<string>;
  getStats: () => Promise<DatabaseStats>;
  getChannelStats: (
    port: string,
    channel: number,
    startTime: number,
    endTime: number,
  ) => Promise<ChannelStats>;
  getDataByTimeRange: (
    port: string,
    startTime: number,
    endTime: number,
    limit?: number,
  ) => Promise<SensorDataRecord[]>;
  getLastRecords: (port: string, limit?: number) => Promise<SensorDataRecord[]>;
  createBackup: () => Promise<DatabaseBackupResult>;
  restoreBackup: () => Promise<DatabaseBackupResult>;
  exportData: (options: DatabaseExportOptions) => Promise<DatabaseExportResult>;
  vacuum: () => Promise<{ success: boolean; error?: string }>;
  clear: () => Promise<{ success: boolean; error?: string }>;
}
