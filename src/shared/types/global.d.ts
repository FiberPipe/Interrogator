export interface SerialPortInfo {
  path: string;
  manufacturer?: string;
  serialNumber?: string;
  vendorId?: string;
  productId?: string;
  busy: boolean;
}

export interface SerialOpenResult {
  ok?: boolean;
  error?: string;
}

export interface SerialDataEvent {
  port: string;
  data: string;
}

export interface SerialAPI {
  getPorts(): Promise<SerialPortInfo[]>;
  open(path: string, baud: number): Promise<SerialOpenResult>;
  close(path: string): Promise<SerialOpenResult>;
  onData(cb: (data: SerialDataEvent) => void): () => void;
  onClosed(cb: (port: string) => void): () => void;
  onError(cb: (data: { port: string; error: string }) => void): () => void;
}

// App Data Types
export interface AppDataAPI {
  getAll(): Promise<Record<string, unknown>>;
  set(key: string, value: unknown): Promise<void>;
  delete(key: string): Promise<void>;
  patch(patch: Record<string, unknown>): Promise<void>;
  get(key: string): Promise<string | undefined>;
}

// Database Types
export type DatabaseLocation = 'userData' | 'appPath' | 'documents' | 'custom';

export interface DatabaseConfig {
  location: DatabaseLocation;
  customPath?: string;
  filename: string;
}

export interface DatabasePathInfo {
  path: string;
  exists: boolean;
  size: number;
  sizeFormatted: string;
  userDataPath: string;
  config: DatabaseConfig;
  allPossiblePaths: Record<DatabaseLocation, string>;
}

export interface DatabaseSession {
  id: number;
  port: string;
  start_time: number;
  end_time?: number;
  record_count: number;
  status: 'active' | 'stopped' | 'error';
}

export interface DatabaseStats {
  totalSessions: number;
  totalRecords: number;
  totalSize: number;
  totalSizeFormatted: string;
  sessions: DatabaseSession[];
}

export interface ChannelStats {
  count: number;
  min: number;
  max: number;
  avg: number;
}

export interface SensorDataRecord {
  id: number;
  record_id: string;
  timestamp: number;
  time: string;
  port: string;
  raw_data: string;
  created_at: number;
}

export interface DatabaseChangeLocationResult {
  success: boolean;
  path?: string;
  error?: string;
}

export interface DatabaseBackupResult {
  success: boolean;
  path?: string;
  error?: string;
  cancelled?: boolean;
}

export interface DatabaseExportOptions {
  format: 'csv' | 'json' | 'sql';
  timeRange: 'allData' | 'lastHour' | 'lastDay' | 'lastWeek' | 'custom';
  startTime?: number;
  endTime?: number;
  port?: string;
  channels?: number[];
}

export interface DatabaseExportResult {
  success: boolean;
  path?: string;
  error?: string;
  cancelled?: boolean;
}

export interface DatabaseAPI {
  // Path and Config
  getPath(): Promise<DatabasePathInfo>;
  changeLocation(
    location: DatabaseLocation,
    customPath?: string,
  ): Promise<DatabaseChangeLocationResult>;
  selectCustomPath(): Promise<string | null>;
  openFolder(): Promise<string>;

  // Statistics
  getStats(): Promise<DatabaseStats>;
  getChannelStats(
    port: string,
    channel: number,
    startTime: number,
    endTime: number,
  ): Promise<ChannelStats>;

  // Data Queries
  getDataByTimeRange(
    port: string,
    startTime: number,
    endTime: number,
    limit?: number,
  ): Promise<SensorDataRecord[]>;
  getLastRecords(port: string, limit?: number): Promise<SensorDataRecord[]>;

  // Backup and Restore
  createBackup(): Promise<DatabaseBackupResult>;
  restoreBackup(): Promise<DatabaseBackupResult>;

  // Export
  exportData(options: DatabaseExportOptions): Promise<DatabaseExportResult>;

  // Maintenance
  vacuum(): Promise<{ success: boolean; error?: string }>;
  clear(): Promise<{ success: boolean; error?: string }>;
}

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogEntry {
  id?: number;
  timestamp: number;
  level: LogLevel;
  message: string;
  context?: string;
  stack?: string;
  created_at?: number;
}

export interface LogsStats {
  total: number;
  byLevel: Record<string, number>;
  oldestLog: number | null;
  newestLog: number | null;
}

export interface LogsFilter {
  level?: LogLevel;
  startTime?: number;
  endTime?: number;
  limit?: number;
  search?: string;
}

/**
 * Logs API
 */
export interface LogsAPI {
  /**
   * Получение логов с фильтрацией
   */
  get: (filter: LogsFilter) => Promise<LogEntry[]>;

  /**
   * Получение статистики логов
   */
  getStats: () => Promise<LogsStats>;

  /**
   * Очистка старых логов (старше 3 дней)
   */
  cleanup: () => Promise<{ success: boolean; deletedCount: number; error?: string }>;

  /**
   * Полная очистка всех логов
   */
  clear: () => Promise<{ success: boolean; error?: string }>;

  /**
   * Экспорт логов в JSON
   */
  export: (options?: {
    level?: string;
    startTime?: number;
    endTime?: number;
  }) => Promise<{ success: boolean; path?: string; cancelled?: boolean; error?: string }>;

  /**
   * Отправка лога из renderer процесса
   */
  send: (level: 'debug' | 'info' | 'warn' | 'error', message: string, ...args: any[]) => void;
}

/**
 * --------------------
 * Window Interface
 * --------------------
 */
declare global {
  interface Window {
    serial: SerialAPI;
    appData: AppDataAPI;
    database: DatabaseAPI;
    logs: LogsAPI;
  }
}

export {};
