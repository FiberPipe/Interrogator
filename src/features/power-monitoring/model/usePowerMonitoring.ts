import { useState, useEffect, useCallback, useMemo } from 'react';

import type { RowData } from '../../../shared/types/microcontroller-data';

export interface PowerTableRow {
  id: number;
  channelName: string;
  rangeMin: number;
  rangeMax: number;
  currentValue: number;
  alarmMin: number | null;
  alarmMax: number | null;
}

/**
 * Главный хук для фичи мониторинга мощности
 */
export const usePowerMonitoring = (data: RowData[]) => {
  const [alarmsMap, setAlarmsMap] = useState<
    Record<number, { min: number | null; max: number | null }>
  >({});
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка всех алармов при монтировании
  useEffect(() => {
    const loadAllAlarms = async () => {
      setIsLoading(true);
      try {
        const loaded: Record<number, { min: number | null; max: number | null }> = {};

        for (let channelId = 0; channelId < 16; channelId++) {
          const minKey = `power${channelId}_min`;
          const maxKey = `power${channelId}_max`;

          const [minVal, maxVal] = await Promise.all([
            window.appData.get(minKey),
            window.appData.get(maxKey),
          ]);

          loaded[channelId] = {
            min: minVal !== undefined && minVal !== null ? Number(minVal) : null,
            max: maxVal !== undefined && maxVal !== null ? Number(maxVal) : null,
          };
        }

        setAlarmsMap(loaded);
      } catch (error) {
        console.error('Failed to load power alarms:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllAlarms();
  }, []);

  // Обновление алармов
  const updateChannelAlarms = useCallback(
    (channelId: number, alarms: { min: number | null; max: number | null }) => {
      setAlarmsMap((prev) => ({
        ...prev,
        [channelId]: alarms,
      }));
    },
    [],
  );

  // Формирование строк таблицы
  const powerRows: PowerTableRow[] = useMemo(() => {
    if (data.length === 0) return [];

    const latestRecord = data[data.length - 1];
    if (!latestRecord) return [];

    const rows: PowerTableRow[] = [];

    for (let channelId = 0; channelId < 16; channelId++) {
      const powerKey = `P${channelId}` as keyof RowData;

      // Вычисляем min/max из всего буфера
      let rangeMin = Infinity;
      let rangeMax = -Infinity;

      data.forEach((record) => {
        const value = record[powerKey] as number | undefined;
        if (value !== undefined && !isNaN(value) && isFinite(value)) {
          if (value < rangeMin) rangeMin = value;
          if (value > rangeMax) rangeMax = value;
        }
      });

      // Текущее значение из normalized
      const normalizedKey = `P${channelId}` as keyof typeof latestRecord.normalized;
      const currentValue = latestRecord.normalized[normalizedKey] ?? 0;

      const alarms = alarmsMap[channelId] || { min: null, max: null };

      rows.push({
        id: channelId,
        channelName: `P${channelId}`,
        rangeMin: rangeMin === Infinity ? 0 : rangeMin,
        rangeMax: rangeMax === -Infinity ? 0 : rangeMax,
        currentValue: Number(currentValue) || 0,
        alarmMin: alarms.min,
        alarmMax: alarms.max,
      });
    }

    return rows;
  }, [data, alarmsMap]);

  return {
    powerRows,
    alarmsMap,
    updateChannelAlarms,
    isLoading,
  };
};
