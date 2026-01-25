import { useState, useEffect, useCallback, useMemo } from 'react';

import type { RowData } from '../../../shared/types/microcontroller-data';

export interface WavelengthTableRow {
  id: number;
  channelName: string;
  rangeMin: number;
  rangeMax: number;
  currentValue: number;
  alarmMin: number | null;
  alarmMax: number | null;
}

/**
 * Главный хук для фичи мониторинга длин волн
 */
export const useWavelengthMonitoring = (data: RowData[]) => {
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

        for (let sensorId = 0; sensorId < 16; sensorId++) {
          const minKey = `wavelength${sensorId}_min`;
          const maxKey = `wavelength${sensorId}_max`;

          const [minVal, maxVal] = await Promise.all([
            window.appData.get(minKey),
            window.appData.get(maxKey),
          ]);

          loaded[sensorId] = {
            min: minVal !== undefined && minVal !== null ? Number(minVal) : null,
            max: maxVal !== undefined && maxVal !== null ? Number(maxVal) : null,
          };
        }

        setAlarmsMap(loaded);
      } catch (error) {
        console.error('Failed to load wavelength alarms:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllAlarms();
  }, []);

  // Обновление алармов для конкретного датчика
  const updateSensorAlarms = useCallback(
    (sensorId: number, alarms: { min: number | null; max: number | null }) => {
      setAlarmsMap((prev) => ({
        ...prev,
        [sensorId]: alarms,
      }));
    },
    [],
  );

  // Формирование строк таблицы
  const wavelengthRows: WavelengthTableRow[] = useMemo(() => {
    if (data.length === 0) return [];

    const latestData = data[data.length - 1];
    if (!latestData?.wavelengths) return [];

    const rows: WavelengthTableRow[] = [];

    // Получаем все ключи wavelength
    Object.keys(latestData.wavelengths).forEach((key) => {
      const match = key.match(/^wavelength(\d+)$/);
      if (!match) return;

      const sensorId = parseInt(match[1], 10);
      const currentValue = latestData.wavelengths[key as keyof typeof latestData.wavelengths];

      if (currentValue === undefined || isNaN(currentValue) || !isFinite(currentValue)) return;

      // Вычисляем min/max из всего буфера
      let rangeMin = Infinity;
      let rangeMax = -Infinity;

      data.forEach((record) => {
        const value = record.wavelengths[key as keyof typeof record.wavelengths];
        if (value !== undefined && !isNaN(value) && isFinite(value)) {
          if (value < rangeMin) rangeMin = value;
          if (value > rangeMax) rangeMax = value;
        }
      });

      const alarms = alarmsMap[sensorId] || { min: null, max: null };

      rows.push({
        id: sensorId,
        channelName: key,
        rangeMin: rangeMin === Infinity ? 0 : rangeMin,
        rangeMax: rangeMax === -Infinity ? 0 : rangeMax,
        currentValue,
        alarmMin: alarms.min,
        alarmMax: alarms.max,
      });
    });

    return rows.sort((a, b) => a.id - b.id);
  }, [data, alarmsMap]);

  return {
    wavelengthRows,
    alarmsMap,
    updateSensorAlarms,
    isLoading,
  };
};
