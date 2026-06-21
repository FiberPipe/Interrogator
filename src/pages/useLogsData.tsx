// src/pages/logs/model/useLogsData.ts

import { useState, useCallback, useRef, useMemo } from 'react';
import { logsApi } from '../shared/api/logger.api';
import { LogEntry, LogsStats, LogsFilter } from '../shared/types/logs.types';


interface UseLogsDataReturn {
  logs: LogEntry[];
  stats: LogsStats | null;
  isLoading: boolean;
  isStatsLoading: boolean;
  error?: string;
  loadLogs: () => Promise<void>;
  loadStats: () => Promise<void>;
  refresh: () => void;
}

// Простой кэш для статистики
const statsCache = {
  data: null as LogsStats | null,
  timestamp: 0,
  ttl: 30000, // 30 секунд
};

export const useLogsData = (filter: LogsFilter): UseLogsDataReturn => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<LogsStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [error, setError] = useState<string>();
  
  // Отмена предыдущих запросов
  const abortControllerRef = useRef<AbortController | null>(null);
  const previousFilterRef = useRef<string>('');

  const loadLogs = useCallback(async () => {
    // Отменяем предыдущий запрос
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const currentFilter = JSON.stringify(filter);
    
    // Проверяем, изменился ли фильтр
    if (previousFilterRef.current === currentFilter && logs.length > 0) {
      return; // Не перезагружаем, если фильтр не изменился
    }
    
    previousFilterRef.current = currentFilter;
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(undefined);
    
    try {
      const data = await logsApi.get(filter);
      
      // Проверяем, не был ли запрос отменён
      if (!abortControllerRef.current.signal.aborted) {
        setLogs(data);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Игнорируем отменённые запросы
      }
      
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      console.error('[useLogsData] Failed to load logs:', err);
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [filter, logs.length]);

  const loadStats = useCallback(async () => {
    // Проверяем кэш
    const now = Date.now();
    if (statsCache.data && (now - statsCache.timestamp) < statsCache.ttl) {
      setStats(statsCache.data);
      return;
    }

    setIsStatsLoading(true);
    try {
      const data = await logsApi.getStats();
      
      // Сохраняем в кэш
      statsCache.data = data;
      statsCache.timestamp = now;
      
      setStats(data);
    } catch (err) {
      console.error('[useLogsData] Failed to load stats:', err);
      setStats(null);
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    // Сбрасываем кэш статистики
    statsCache.timestamp = 0;
    previousFilterRef.current = '';
    
    loadLogs();
    loadStats();
  }, [loadLogs, loadStats]);

  // Мемоизируем возвращаемое значение
  return useMemo(() => ({
    logs,
    stats,
    isLoading,
    isStatsLoading,
    error,
    loadLogs,
    loadStats,
    refresh,
  }), [logs, stats, isLoading, isStatsLoading, error, loadLogs, loadStats, refresh]);
};
