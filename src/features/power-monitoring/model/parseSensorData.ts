import type { RowData } from '../../../shared/types/microcontroller-data';

export interface PowerTableRow {
  id: number; // 0-15
  channelName: string; // "P0"-"P15"
  rangeMin: number; // Минимум из всего буфера
  rangeMax: number; // Максимум из всего буфера
  currentValue: number; // Из normalized последней записи
}

/**
 * Преобразует буфер данных в строки таблицы мощности
 * Каждая строка = канал P0-P15
 */
export const transformToPowerTableRows = (dataBuffer: RowData[]): PowerTableRow[] => {
  const rows: PowerTableRow[] = [];

  // Последняя запись для текущих значений
  const latestRecord = dataBuffer[dataBuffer.length - 1];

  if (!latestRecord) return [];

  for (let channelId = 0; channelId < 16; channelId++) {
    const powerKey = `P${channelId}` as keyof RowData;

    // Вычисляем min/max из всего буфера
    let min = Infinity;
    let max = -Infinity;

    dataBuffer.forEach((record) => {
      const value = record[powerKey] as number | undefined;
      if (value !== undefined && !isNaN(value)) {
        if (value < min) min = value;
        if (value > max) max = value;
      }
    });

    // Текущее значение из normalized
    const normalizedKey = `P${channelId}` as keyof typeof latestRecord.normalized;
    const currentValue = latestRecord.normalized[normalizedKey] ?? 0;

    rows.push({
      id: channelId,
      channelName: `P${channelId}`,
      rangeMin: min === Infinity ? 0 : min,
      rangeMax: max === -Infinity ? 0 : max,
      currentValue: Number(currentValue) || 0,
    });
  }

  return rows;
};

/**
 * Проверяет, выходит ли значение за пороги alarm
 */
export const checkAlarmStatus = (
  value: number,
  alarmMin: number | null,
  alarmMax: number | null,
): 'ok' | 'warning' | 'danger' => {
  // Критическое превышение
  if (alarmMin !== null && value < alarmMin) return 'danger';
  if (alarmMax !== null && value > alarmMax) return 'danger';

  // Предупреждение если близко к границам (в пределах 5%)
  if (alarmMin !== null && value < alarmMin * 1.05) return 'warning';
  if (alarmMax !== null && value > alarmMax * 0.95) return 'warning';

  return 'ok';
};

/**
 * Получить статистику по каналу из буфера
 */
export const getChannelStats = (
  dataBuffer: RowData[],
  channelId: number,
): { min: number; max: number; avg: number; last: number } => {
  if (dataBuffer.length === 0) {
    return { min: 0, max: 0, avg: 0, last: 0 };
  }

  const powerKey = `P${channelId}` as keyof RowData;
  const values: number[] = [];

  dataBuffer.forEach((record) => {
    const value = record[powerKey] as number | undefined;
    if (value !== undefined && !isNaN(value)) {
      values.push(value);
    }
  });

  if (values.length === 0) {
    return { min: 0, max: 0, avg: 0, last: 0 };
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
  const last = values[values.length - 1];

  return { min, max, avg, last };
};
