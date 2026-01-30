export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export type LogArea =
  | 'App' // Основное приложение
  | 'Database' // База данных
  | 'Serial' // Работа с Serial портами
  | 'Updater' // Система обновлений
  | 'Logger' // Сам логгер
  | 'IPC' // IPC коммуникация
  | 'UI' // Пользовательский интерфейс
  | 'Storage' // Хранилище данных
  | 'Settings' // Настройки
  | 'Export' // Экспорт данных
  | 'Import' // Импорт данных
  | 'Backup' // Резервное копирование
  | 'Session' // Сессии
  | 'Chart' // Графики
  | 'Filter' // Фильтрация
  | 'Network' // Сетевые операции
  | 'FileSystem' // Файловая система
  | 'Performance' // Производительность
  | 'Security' // Безопасность
  | 'Unknown'; // Неопределенная область

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

export interface LogsStats {
  total: number;
  byLevel: Record<string, number>;
  byArea: Record<string, number>;
  oldestLog: number | null;
  newestLog: number | null;
}

export interface LogsFilter {
  level?: LogLevel;
  area?: LogArea;
  startTime?: number;
  endTime?: number;
  limit?: number;
  search?: string;
  errorCode?: string;
}

export interface LogsCleanupResult {
  success: boolean;
  deletedCount: number;
  error?: string;
}

export interface LogsClearResult {
  success: boolean;
  error?: string;
}

export interface LogsExportOptions {
  level?: string;
  area?: string;
  startTime?: number;
  endTime?: number;
}

export interface LogsExportResult {
  success: boolean;
  path?: string;
  cancelled?: boolean;
  error?: string;
}

export interface LogsAPI {
  get: (filter: LogsFilter) => Promise<LogEntry[]>;
  getStats: () => Promise<LogsStats>;
  cleanup: () => Promise<LogsCleanupResult>;
  clear: () => Promise<LogsClearResult>;
  export: (options?: LogsExportOptions) => Promise<LogsExportResult>;
  send: (level: LogLevel, area: LogArea, message: string, metadata?: LogMetadata) => void;
}
