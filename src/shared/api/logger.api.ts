// src/shared/api/logs/logs.api.ts

import { LogsStats, LogsFilter, LogEntry, LogsCleanupResult, LogsClearResult, LogsExportOptions, LogsExportResult } from "../types/logs.types";



const isLogsAvailable = (): boolean => {
  return typeof window !== 'undefined' && window?.electron?.logs !== undefined;
};

const getDefaultStats = (): LogsStats => ({
  total: 0,
  byLevel: {} as Record<string, number>,
  byArea: {} as Record<string, number>,
  oldestLog: null,
  newestLog: null,
});

export const logsApi = {
  /**
   * Получить логи с фильтрацией
   */
  async get(filter: LogsFilter): Promise<LogEntry[]> {
    if (!isLogsAvailable()) {
      console.warn('[LOGS-API] API not available');
      return [];
    }
    try {
      return await window.electron.logs.get(filter);
    } catch (error) {
      console.error('[LOGS-API] Failed to get logs:', error);
      throw error;
    }
  },

  /**
   * Получить статистику логов
   */
  async getStats(): Promise<LogsStats> {
    if (!isLogsAvailable()) {
      console.warn('[LOGS-API] API not available');
      return getDefaultStats();
    }
    try {
      return await window.electron.logs.getStats();
    } catch (error) {
      console.error('[LOGS-API] Failed to get stats:', error);
      return getDefaultStats();
    }
  },

  /**
   * Очистить старые логи (старше 3 дней)
   */
  async cleanup(): Promise<LogsCleanupResult> {
    if (!isLogsAvailable()) {
      throw new Error('Logs API not available');
    }
    return await window.electron.logs.cleanup();
  },

  /**
   * Очистить все логи
   */
  async clear(): Promise<LogsClearResult> {
    if (!isLogsAvailable()) {
      throw new Error('Logs API not available');
    }
    return await window.electron.logs.clear();
  },

  /**
   * Экспортировать логи в файл
   */
  async export(options?: LogsExportOptions): Promise<LogsExportResult> {
    if (!isLogsAvailable()) {
      throw new Error('Logs API not available');
    }
    return await window.electron.logs.export(options);
  },
};
