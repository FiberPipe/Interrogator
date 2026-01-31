// src/shared/api/logger.api.ts

import type { LogArea, LogMetadata } from '../types/logs.types';

/**
 * Проверка доступности logger API
 */
const isLoggerAvailable = (): boolean => {
  return typeof window !== 'undefined' && window?.electron.logger !== undefined;
};

export const loggerApi = {
  /**
   * Debug лог
   */
  debug(area: LogArea, message: string, metadata?: LogMetadata): void {
    if (!isLoggerAvailable()) {
      console.debug(`[${area}]`, message, metadata);
      return;
    }
    window.electron.logger.debug(area, message, metadata);
  },

  /**
   * Info лог
   */
  info(area: LogArea, message: string, metadata?: LogMetadata): void {
    if (!isLoggerAvailable()) {
      console.info(`[${area}]`, message, metadata);
      return;
    }
    window.electron.logger.info(area, message, metadata);
  },

  /**
   * Warning лог
   */
  warn(area: LogArea, message: string, metadata?: LogMetadata, error?: unknown): void {
    if (!isLoggerAvailable()) {
      console.warn(`[${area}]`, message, metadata, error);
      return;
    }
    window.electron.logger.warn(area, message, metadata, error);
  },

  /**
   * Error лог
   */
  error(area: LogArea, message: string, metadata?: LogMetadata, error?: unknown): void {
    if (!isLoggerAvailable()) {
      console.error(`[${area}]`, message, metadata, error);
      return;
    }
    window.electron.logger.error(area, message, metadata, error);
  },

  /**
   * Логирование ошибки
   */
  logError(error: Error, additionalMetadata?: LogMetadata): void {
    if (!isLoggerAvailable()) {
      console.error('Error:', error, additionalMetadata);
      return;
    }
    window.electron.logger.logError(error, additionalMetadata);
  },
};
