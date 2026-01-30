import { useState, useEffect, useCallback } from 'react';

import { addDangerToaster } from '../../../ui/shared/ui';

export interface DatabaseStats {
  totalSize: number;
  totalSizeFormatted: string;
  totalSessions: number;
  totalRecords: number;
  activeSessions: number;
  lastSession?: {
    id: number;
    port: string;
    start_time: number;
    record_count: number;
  };
}

export const useDatabaseStats = () => {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await window.database.getStats();
      setStats(data);
    } catch (err) {
      addDangerToaster('[useDatabaseStats] Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();

    // Обновляем статистику каждые 5 секунд
    const interval = setInterval(loadStats, 5000);

    return () => clearInterval(interval);
  }, [loadStats]);

  return {
    stats,
    loading,
    refresh: loadStats,
  };
};
