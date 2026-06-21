// src/entities/log/model/types.ts

/**
 * Уровни логирования
 */
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

/**
 * Области логирования
 */
export type LogArea =
  | 'App'
  | 'Database'
  | 'Serial'
  | 'ASE'
  | 'Updater'
  | 'Logger'
  | 'IPC'
  | 'UI'
  | 'Storage'
  | 'Settings'
  | 'Export'
  | 'Import'
  | 'Backup'
  | 'Session'
  | 'Chart'
  | 'Filter'
  | 'Network'
  | 'FileSystem'
  | 'Performance'
  | 'Security'
  | 'Connection'
  | 'Preload'
  | 'DataProcessor'
  | 'PortManager'
  | 'Window'
  | 'Unknown';

/**
 * Метаданные лога
 */
export interface LogMetadata {
  [key: string]: unknown;
  errorCode?: string;
  errorType?: string;
  errorStatus?: 'handled' | 'unhandled' | 'recovered';
  duration?: number;
  operationId?: string;
  userId?: string;
  traceId?: string;
  spanId?: string;
  context?: Record<string, unknown>;
}

/**
 * Запись лога
 */
export interface LogEntry {
  id?: number;
  timestamp: number;
  level: LogLevel;
  area: LogArea;
  message: string;
  metadata?: string; // JSON строка
  stack?: string;
  created_at?: number;
}

/**
 * Фильтр для логов
 */
export interface LogsFilter {
  level?: LogLevel;
  area?: LogArea;
  startTime?: number;
  endTime?: number;
  limit?: number;
  search?: string;
  errorCode?: string;
}

/**
 * Статистика логов
 */
export interface LogsStats {
  total: number;
  byLevel: Record<LogLevel, number>;
  byArea: Record<LogArea, number>;
  oldestLog: number | null;
  newestLog: number | null;
}

/**
 * Результат очистки логов
 */
export interface LogsCleanupResult {
  success: boolean;
  deletedCount: number;
  error?: string;
}

/**
 * Результат полной очистки
 */
export interface LogsClearResult {
  success: boolean;
  error?: string;
}

/**
 * Опции экспорта логов
 */
export interface LogsExportOptions {
  level?: LogLevel;
  area?: LogArea;
  startTime?: number;
  endTime?: number;
}

/**
 * Результат экспорта логов
 */
export interface LogsExportResult {
  success: boolean;
  path?: string;
  cancelled?: boolean;
  error?: string;
}

/**
 * API для работы с логами (Renderer Process)
 */
export interface LogsAPI {
  get: (filter: LogsFilter) => Promise<LogEntry[]>;
  getStats: () => Promise<LogsStats>;
  cleanup: () => Promise<LogsCleanupResult>;
  clear: () => Promise<LogsClearResult>;
  export: (options?: LogsExportOptions) => Promise<LogsExportResult>;
}

/**
 * API для логгера (Main Process)
 */
export interface ILogger {
  debug(area: LogArea, message: string, metadata?: LogMetadata): void;
  info(area: LogArea, message: string, metadata?: LogMetadata): void;
  warn(area: LogArea, message: string, metadata?: LogMetadata, error?: unknown): void;
  error(area: LogArea, message: string, metadata?: LogMetadata, error?: unknown): void;
  logError(error: Error, additionalMetadata?: LogMetadata): void;
  withLogging<T>(
    area: LogArea,
    operation: string,
    fn: () => Promise<T>,
    metadata?: LogMetadata,
  ): Promise<T>;
  withLoggingSync<T>(area: LogArea, operation: string, fn: () => T, metadata?: LogMetadata): T;
  setDatabaseWriter(writer: (logs: LogEntry[]) => Promise<void>): void;
  shutdown(): Promise<void>;
}

/**
 * API для логгера (Renderer Process)
 */
export interface LoggerAPI {
  debug(area: LogArea, message: string, metadata?: LogMetadata): void;
  info(area: LogArea, message: string, metadata?: LogMetadata): void;
  warn(area: LogArea, message: string, metadata?: LogMetadata, error?: unknown): void;
  error(area: LogArea, message: string, metadata?: LogMetadata, error?: unknown): void;
  logError(error: Error, additionalMetadata?: LogMetadata): void;
}
