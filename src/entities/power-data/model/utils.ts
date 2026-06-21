import type { PowerDataPoint, GroupedPowerItem } from './types';

export const groupDataByPowerId = (data: PowerDataPoint[]): GroupedPowerItem[] => {
  const groupedData: Record<number, number[]> = {};

  data.forEach((item) => {
    Object.keys(item).forEach((key) => {
      const idMatch = key.match(/^P(\d+)$/);
      if (!idMatch) return;

      const sensorId = Number(idMatch[1]);
      const value = Number(item[key as keyof typeof item]);
      if (isNaN(value)) return;

      if (!groupedData[sensorId]) groupedData[sensorId] = [];
      groupedData[sensorId].push(value);
    });
  });

  return Object.keys(groupedData)
    .map((key) => {
      const id = Number(key);
      const values = groupedData[id];

      return {
        id,
        currentValue: values[values.length - 1] || 0,
        rangeMin: values.length ? Math.min(...values) : 0,
        rangeMax: values.length ? Math.max(...values) : 0,
        values: values.slice(-50), // Последние 50 значений для графика
      };
    })
    .sort((a, b) => a.id - b.id);
};

export const isAlarmTriggered = (
  value: number,
  alarmMin?: number,
  alarmMax?: number,
): 'min' | 'max' | null => {
  if (alarmMin !== undefined && value < alarmMin) return 'min';
  if (alarmMax !== undefined && value > alarmMax) return 'max';
  return null;
};

export const formatValue = (value: number, decimals = 3): string => {
  return value.toFixed(decimals);
};
