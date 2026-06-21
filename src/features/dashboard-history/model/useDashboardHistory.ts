// src/features/dashboard-history/model/useDashboardHistory.ts

import { useCallback, useState } from 'react';

import { databaseApi } from '../../../shared/api/database.api';
import type { ChannelStatsWithId } from '../../../shared/types/database.types';

export type HistoryRange = '1h' | '24h' | '7d';

const RANGE_MS: Record<HistoryRange, number> = {
  '1h': 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
};

interface DashboardHistoryState {
  stats: ChannelStatsWithId[];
  loading: boolean;
  error: string | null;
  loaded: boolean;
}

/**
 * Загрузка агрегированной статистики по всем каналам за выбранный период.
 */
export const useDashboardHistory = (port: string | null) => {
  const [range, setRange] = useState<HistoryRange>('24h');
  const [state, setState] = useState<DashboardHistoryState>({
    stats: [],
    loading: false,
    error: null,
    loaded: false,
  });

  const load = useCallback(
    async (selectedRange: HistoryRange = range): Promise<void> => {
      if (port === null) return;

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const endTime = Date.now();
        const startTime = endTime - RANGE_MS[selectedRange];
        const stats = await databaseApi.getChannelStatsAll(port, startTime, endTime);
        setState({ stats, loading: false, error: null, loaded: true });
      } catch (err) {
        setState({ stats: [], loading: false, error: String(err), loaded: true });
      }
    },
    [port, range],
  );

  const changeRange = useCallback(
    (next: HistoryRange): void => {
      setRange(next);
      void load(next);
    },
    [load],
  );

  return {
    ...state,
    range,
    setRange: changeRange,
    load,
  };
};
