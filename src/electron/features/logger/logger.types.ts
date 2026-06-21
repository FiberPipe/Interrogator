// src/electron/features/logger/logger.types.ts

import type { LogArea, LogMetadata, LogEntry } from '../../../shared/types/logs.types';

export enum LogLevelEnum {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export const CURRENT_LOG_LEVEL = LogLevelEnum.DEBUG;

export enum LogsIPC {
  Get = 'logs:get',
  GetStats = 'logs:getStats',
  Cleanup = 'logs:cleanup',
  Clear = 'logs:clear',
  Export = 'logs:export',
  SendDebug = 'logs:send:debug',
  SendInfo = 'logs:send:info',
  SendWarn = 'logs:send:warn',
  SendError = 'logs:send:error',
}

export interface LoggerAPI {
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

export interface LoggerConfig {
  enableConsole: boolean;
  enableFile: boolean;
  enableDatabase: boolean;
  minLevel: LogLevelEnum;
}
