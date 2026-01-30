import { useState, useEffect, useCallback, useMemo } from 'react';

import type { TemperatureCoefficients } from '../../../../entities/temperature';
import { calculateTemperature } from '../../../../entities/temperature';
import type { RowData } from '../../../ui/shared/types/microcontroller-data';

export interface TemperatureTableRow {
  id: number;
  wavelength: number;
  temperature: number;
  coefficients: TemperatureCoefficients;
  hasCoefficients: boolean;
}

const DEFAULT_COEFFICIENTS: TemperatureCoefficients = {
  lambda0: 0,
  E: 0,
  D: 0,
  C: 0,
  B: 0,
  A: 0,
};

/**
 * Главный хук для фичи температурного мониторинга
 */
export const useTemperatureMonitoring = (data: RowData[]) => {
  const [coefficientsMap, setCoefficientsMap] = useState<Record<number, TemperatureCoefficients>>(
    {},
  );
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка всех коэффициентов при монтировании
  useEffect(() => {
    const loadAllCoefficients = async () => {
      setIsLoading(true);
      try {
        const loaded: Record<number, TemperatureCoefficients> = {};

        // Загружаем для всех возможных датчиков (0-15)
        for (let sensorId = 0; sensorId < 16; sensorId++) {
          const keys: Array<keyof TemperatureCoefficients> = ['lambda0', 'E', 'D', 'C', 'B', 'A'];

          const coeffs: Partial<TemperatureCoefficients> = {};

          await Promise.all(
            keys.map(async (key) => {
              const storageKey = `Temp_${key}_${sensorId}`;
              const value = await window.appData.get(storageKey);
              coeffs[key] = value !== undefined && value !== null ? Number(value) : 0;
            }),
          );

          loaded[sensorId] = coeffs as TemperatureCoefficients;
        }

        setCoefficientsMap(loaded);
      } catch (error) {
        console.error('Failed to load temperature coefficients:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllCoefficients();
  }, []);

  // Обновление коэффициентов для конкретного датчика
  const updateSensorCoefficients = useCallback(
    (sensorId: number, coefficients: TemperatureCoefficients) => {
      setCoefficientsMap((prev) => ({
        ...prev,
        [sensorId]: coefficients,
      }));
    },
    [],
  );

  // Вычисленные температуры
  const temperatureRows: TemperatureTableRow[] = useMemo(() => {
    if (data.length === 0) return [];

    const latestData = data[data.length - 1];
    if (!latestData?.wavelengths) return [];

    const rows: TemperatureTableRow[] = [];

    // Получаем все ключи wavelength из последней записи
    Object.keys(latestData.wavelengths).forEach((key) => {
      const match = key.match(/^wavelength(\d+)$/);
      if (!match) return;

      const sensorId = parseInt(match[1], 10);
      const wavelength = latestData.wavelengths[key as keyof typeof latestData.wavelengths];

      // Пропускаем невалидные wavelength
      if (wavelength === undefined || isNaN(wavelength) || !isFinite(wavelength)) return;

      // Получаем коэффициенты (или дефолтные)
      const coeffs = coefficientsMap[sensorId] || DEFAULT_COEFFICIENTS;

      // Проверяем, есть ли хоть один ненулевой коэффициент
      const hasCoefficients = Object.values(coeffs).some(
        (val) => typeof val === 'number' && val !== 0 && isFinite(val),
      );

      // Вычисляем температуру (будет 0 или NaN если коэффициенты не заданы)
      const temperature = hasCoefficients ? calculateTemperature(wavelength, coeffs) : 0;

      rows.push({
        id: sensorId,
        wavelength,
        temperature,
        coefficients: coeffs,
        hasCoefficients,
      });
    });

    // Сортируем по id
    return rows.sort((a, b) => a.id - b.id);
  }, [data, coefficientsMap]);

  return {
    temperatureRows,
    coefficientsMap,
    updateSensorCoefficients,
    isLoading,
  };
};
