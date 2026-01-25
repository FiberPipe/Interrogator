import { useMemo } from 'react';

import { calculateTemperature } from '../../../entities/sensor-data/model/calculators';
import type { TemperatureCoefficients } from '../../../entities/sensor-data/model/types';

interface DataPoint {
  [key: string]: any;
}

export const useTemperatureCalculations = (
  data: DataPoint[],
  coefficientsMap: Record<number, TemperatureCoefficients>,
) => {
  return useMemo(() => {
    if (!data.length) return [];

    return data.map((point) => {
      const calculated: any = { ...point, temperatures: {} };

      Object.keys(coefficientsMap).forEach((sensorIndexStr) => {
        const sensorIndex = parseInt(sensorIndexStr);
        const coeffs = coefficientsMap[sensorIndex];
        const wavelength = parseFloat(point[`wavelength${sensorIndex}`]);

        if (isFinite(wavelength) && !isNaN(wavelength)) {
          calculated.temperatures[`T${sensorIndex}`] = calculateTemperature(wavelength, coeffs);
        }
      });

      return calculated;
    });
  }, [data, coefficientsMap]);
};
