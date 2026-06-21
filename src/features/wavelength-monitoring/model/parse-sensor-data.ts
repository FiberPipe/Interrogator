import type { RowData } from '../../../shared/types/microcontroller-data';

export interface WavelengthTableRow {
  id: number; // Индекс wavelength
  channelName: string; // "wavelength0", "wavelength1", etc.
  rangeMin: number; // Минимум из всего буфера
  rangeMax: number; // Максимум из всего буфера
  currentValue: number; // Текущее значение из последней записи
}

/**
 * Преобразует буфер данных в строки таблицы длин волн
 * Каждая строка = wavelength{N}
 */
export const transformToWavelengthTableRows = (dataBuffer: RowData[]): WavelengthTableRow[] => {
  const rows: WavelengthTableRow[] = [];

  // Последняя запись для текущих значений
  const latestRecord = dataBuffer[dataBuffer.length - 1];

  if (!latestRecord || !latestRecord.wavelengths) return [];

  // Получаем все ключи wavelength из последней записи
  const wavelengthKeys = Object.keys(latestRecord.wavelengths).filter((key) =>
    key.startsWith('wavelength'),
  );

  wavelengthKeys.forEach((wavelengthKey) => {
    // Извлекаем индекс из ключа (wavelength0 -> 0)
    const match = wavelengthKey.match(/^wavelength(\d+)$/);
    if (!match) return;

    const channelId = parseInt(match[1], 10);

    // Вычисляем min/max из всего буфера
    let min = Infinity;
    let max = -Infinity;

    dataBuffer.forEach((record) => {
      const value = record.wavelengths[wavelengthKey as keyof typeof record.wavelengths];
      if (value !== undefined && !isNaN(value)) {
        if (value < min) min = value;
        if (value > max) max = value;
      }
    });

    // Текущее значение из последней записи
    const currentValue =
      latestRecord.wavelengths[wavelengthKey as keyof typeof latestRecord.wavelengths] ?? 0;

    rows.push({
      id: channelId,
      channelName: wavelengthKey,
      rangeMin: min === Infinity ? 0 : min,
      rangeMax: max === -Infinity ? 0 : max,
      currentValue: Number(currentValue) || 0,
    });
  });

  // Сортируем по id
  return rows.sort((a, b) => a.id - b.id);
};

/**
 * Получить статистику по wavelength из буфера
 */
export const getWavelengthStats = (
  dataBuffer: RowData[],
  wavelengthKey: string,
): { min: number; max: number; avg: number; last: number } => {
  if (dataBuffer.length === 0) {
    return { min: 0, max: 0, avg: 0, last: 0 };
  }

  const values: number[] = [];

  dataBuffer.forEach((record) => {
    const value = record.wavelengths[wavelengthKey as keyof typeof record.wavelengths];
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
