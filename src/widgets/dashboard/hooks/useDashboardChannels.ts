import { useEffect, useMemo, useState } from 'react';

import { appDataApi } from '../../../shared/api/app-data.api';
import type { RowData } from '../../../shared/types/microcontroller-data';
import type { ChannelStatus } from '../../../entities/sensor/ui/ChannelSummaryCard';

export const CHANNEL_COUNT = 16;

export interface ChannelAlarm {
  min: number | null;
  max: number | null;
}

export interface ChannelSummary {
  index: number;
  power: number;
  wavelength: number;
  values: number[];
  status: ChannelStatus;
  alarmMin: number | null;
  alarmMax: number | null;
}

const SPARKLINE_POINTS = 20;

/**
 * Вычислить статус канала по текущему значению и порогам алерта.
 */
const computeStatus = (
  value: number,
  alarm: ChannelAlarm,
  hasData: boolean,
): ChannelStatus => {
  if (!hasData) return 'idle';

  if (alarm.min !== null && value < alarm.min) return 'danger';
  if (alarm.max !== null && value > alarm.max) return 'danger';
  if (alarm.min !== null && value < alarm.min * 1.05) return 'warning';
  if (alarm.max !== null && value > alarm.max * 0.95) return 'warning';

  return 'ok';
};

/**
 * Загрузить пороги алертов для всех 16 каналов из app-data.
 */
export const useChannelAlarms = (): Record<number, ChannelAlarm> => {
  const [alarms, setAlarms] = useState<Record<number, ChannelAlarm>>({});

  useEffect(() => {
    let cancelled = false;

    const load = async (): Promise<void> => {
      const loaded: Record<number, ChannelAlarm> = {};

      for (let channel = 0; channel < CHANNEL_COUNT; channel++) {
        const [minVal, maxVal] = await Promise.all([
          appDataApi.get(`power${channel}_min`),
          appDataApi.get(`power${channel}_max`),
        ]);

        loaded[channel] = {
          min: minVal !== undefined && minVal !== null ? Number(minVal) : null,
          max: maxVal !== undefined && maxVal !== null ? Number(maxVal) : null,
        };
      }

      if (!cancelled) setAlarms(loaded);
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return alarms;
};

/**
 * Свести live-буфер в сводку по 16 каналам для обзорного грида.
 */
export const useDashboardChannels = (
  dataBuffer: RowData[],
  latestData: RowData | null,
): ChannelSummary[] => {
  const alarms = useChannelAlarms();

  return useMemo(() => {
    return Array.from({ length: CHANNEL_COUNT }, (_, index) => {
      const powerKey = `P${index}` as keyof RowData;
      const wavelengthKey = `wavelength${index}`;

      const values = dataBuffer
        .map((row) => Number(row[powerKey]))
        .filter((value) => !Number.isNaN(value))
        .slice(-SPARKLINE_POINTS);

      const power =
        latestData !== null ? Number(latestData[powerKey]) || 0 : values[values.length - 1] || 0;

      const wavelength =
        latestData?.wavelengths !== undefined
          ? Number(latestData.wavelengths[wavelengthKey as keyof typeof latestData.wavelengths]) || 0
          : 0;

      const alarm = alarms[index] ?? { min: null, max: null };

      return {
        index,
        power,
        wavelength,
        values,
        status: computeStatus(power, alarm, values.length > 0),
        alarmMin: alarm.min,
        alarmMax: alarm.max,
      };
    });
  }, [dataBuffer, latestData, alarms]);
};
