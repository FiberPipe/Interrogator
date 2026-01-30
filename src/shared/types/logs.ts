// src/shared/types/logs.types.ts

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
