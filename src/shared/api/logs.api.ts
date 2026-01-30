// src/shared/api/logs.api.ts

import type { LogsFilter, LogEntry, LogsStats } from '../types/logs';

// Проверка доступности logs API
const isLogsAvailable = () => {
  return typeof window !== 'undefined' && window.logs;
};

export const logsApi = {
  /**
   * Получение логов с фильтрацией
   */
  async getLogs(filter: LogsFilter): Promise<LogEntry[]> {
    if (!isLogsAvailable()) {
      console.error('Logs API is not available');
      return [];
    }
    return window.logs.get(filter);
  },

  /**
   * Получение статистики
   */
  async getStats(): Promise<LogsStats> {
    if (!isLogsAvailable()) {
      console.error('Logs API is not available');
      return {
        total: 0,
        byLevel: {},
        oldestLog: null,
        newestLog: null,
      };
    }
    return window.logs.getStats();
  },

  /**
   * Очистка старых логов
   */
  async cleanup(): Promise<{ success: boolean; deletedCount: number }> {
    if (!isLogsAvailable()) {
      console.error('Logs API is not available');
      return { success: false, deletedCount: 0 };
    }
    return window.logs.cleanup();
  },

  /**
   * Полная очистка
   */
  async clear(): Promise<{ success: boolean }> {
    if (!isLogsAvailable()) {
      console.error('Logs API is not available');
      return { success: false };
    }
    return window.logs.clear();
  },

  /**
   * Экспорт логов
   */
  async export(options?: {
    level?: string;
    startTime?: number;
    endTime?: number;
  }): Promise<{ success: boolean; path?: string; cancelled?: boolean }> {
    if (!isLogsAvailable()) {
      console.error('Logs API is not available');
      return { success: false };
    }
    return window.logs.export(options);
  },
};
