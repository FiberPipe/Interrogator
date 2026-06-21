// src/features/dashboard-settings/model/useDashboardSettings.ts

import { useCallback, useEffect, useState } from 'react';

import { appDataApi } from '../../../shared/api/app-data.api';

export const DASHBOARD_CHANNEL_COUNT = 16;
export const DASHBOARD_COLUMN_OPTIONS = [2, 4, 8] as const;

export type DashboardColumns = (typeof DASHBOARD_COLUMN_OPTIONS)[number];

const STORAGE_KEYS = {
  columns: 'dashboard_columns',
  hiddenChannels: 'dashboard_hidden_channels',
} as const;

const ALL_CHANNELS = Array.from({ length: DASHBOARD_CHANNEL_COUNT }, (_, i) => i);

/**
 * Настройки лейаута дашборда (количество колонок и видимость каналов),
 * сохраняемые в app-data.
 */
export const useDashboardSettings = () => {
  const [columns, setColumns] = useState<DashboardColumns>(4);
  const [hiddenChannels, setHiddenChannels] = useState<number[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async (): Promise<void> => {
      const [storedColumns, storedHidden] = await Promise.all([
        appDataApi.get<DashboardColumns>(STORAGE_KEYS.columns),
        appDataApi.get<number[]>(STORAGE_KEYS.hiddenChannels),
      ]);

      if (cancelled) return;

      if (storedColumns !== undefined && storedColumns !== null) {
        setColumns(storedColumns);
      }
      if (Array.isArray(storedHidden)) {
        setHiddenChannels(storedHidden);
      }
      setLoaded(true);
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const changeColumns = useCallback((next: DashboardColumns): void => {
    setColumns(next);
    void appDataApi.set(STORAGE_KEYS.columns, next);
  }, []);

  const toggleChannel = useCallback((channel: number): void => {
    setHiddenChannels((prev) => {
      const next = prev.includes(channel)
        ? prev.filter((c) => c !== channel)
        : [...prev, channel].sort((a, b) => a - b);
      void appDataApi.set(STORAGE_KEYS.hiddenChannels, next);
      return next;
    });
  }, []);

  const visibleChannels = ALL_CHANNELS.filter((channel) => !hiddenChannels.includes(channel));

  return {
    loaded,
    columns,
    visibleChannels,
    hiddenChannels,
    changeColumns,
    toggleChannel,
  };
};
