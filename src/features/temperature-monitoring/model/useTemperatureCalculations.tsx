import { useMemo } from 'react';

import type { RowData } from '../../../ui/shared/types/microcontroller-data';
import type { TemperatureCoefficients } from '../../../../entities/temperature';
import { calculateTemperature } from '../../../../entities/temperature';

export interface CalculatedTemperatureData extends RowData {
  temperatures: Record<string, number>;
  timestamp: number;
}

/**
 * Хук для вычисления температуры из данных wavelength
 */
export const useTemperatureCalculations = (
  data: RowData[],
  coefficientsMap: Record<number, TemperatureCoefficients>,
): CalculatedTemperatureData[] => {
  return useMemo(() => {
    if (data.length === 0) return [];

    return data.map((point, index) => {
      const temperatures: Record<string, number> = {};

      // Вычисляем температуру для каждого датчика
      Object.keys(coefficientsMap).forEach((sensorIndexStr) => {
        const sensorIndex = parseInt(sensorIndexStr, 10);
        const coeffs = coefficientsMap[sensorIndex];
        const wavelengthKey = `wavelength${sensorIndex}` as keyof typeof point.wavelengths;
        const wavelength = point.wavelengths[wavelengthKey];

        if (wavelength !== undefined && !isNaN(wavelength) && isFinite(wavelength)) {
          const temperature = calculateTemperature(wavelength, coeffs);
          if (isFinite(temperature)) {
            temperatures[`T${sensorIndex}`] = temperature;
          }
        }
      });

      return {
        ...point,
        temperatures,
        timestamp: index,
      };
    });
  }, [data, coefficientsMap]);
};
