// src/features/displacement-monitoring/model/useDisplacementCalculations.ts
import { useMemo } from 'react';
import { calculateDisplacement } from '../../../entities/sensor-data/model/calculators';
import type { DisplacementCoefficients } from '../../../entities/sensor-data/model/types';

interface DataPoint {
  [key: string]: any;
}

export const useDisplacementCalculations = (
  data: DataPoint[],
  coefficientsMap: Record<number, DisplacementCoefficients>
) => {
  return useMemo(() => {
    if (!data.length) return [];

    return data.map((point) => {
      const calculated: any = { ...point, displacements: {} };

      Object.keys(coefficientsMap).forEach((sensorIndexStr) => {
        const sensorIndex = parseInt(sensorIndexStr);
        const coeffs = coefficientsMap[sensorIndex];
        const wavelength = parseFloat(point[`wavelength${sensorIndex}`]);

        if (isFinite(wavelength) && !isNaN(wavelength)) {
          calculated.displacements[`D${sensorIndex}`] = calculateDisplacement(
            wavelength,
            coeffs
          );
        }
      });

      return calculated;
    });
  }, [data, coefficientsMap]);
};
