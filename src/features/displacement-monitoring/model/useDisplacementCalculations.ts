import { useMemo } from 'react';

import type { DisplacementCoefficients } from '../../../../entities/displacement';
import { calculateDisplacement } from '../../../../entities/displacement';
import type { RowData } from '../../../ui/shared/types/microcontroller-data';

export interface CalculatedDisplacementData extends RowData {
  displacements: Record<string, number>;
  timestamp: number;
}

/**
 * Хук для вычисления смещения из данных wavelength
 */
export const useDisplacementCalculations = (
  data: RowData[],
  coefficientsMap: Record<number, DisplacementCoefficients>,
): CalculatedDisplacementData[] => {
  return useMemo(() => {
    if (data.length === 0) return [];

    return data.map((point, index) => {
      const displacements: Record<string, number> = {};

      Object.keys(coefficientsMap).forEach((sensorIndexStr) => {
        const sensorIndex = parseInt(sensorIndexStr, 10);
        const coeffs = coefficientsMap[sensorIndex];
        const wavelengthKey = `wavelength${sensorIndex}` as keyof typeof point.wavelengths;
        const wavelength = point.wavelengths[wavelengthKey];

        if (wavelength !== undefined && !isNaN(wavelength) && isFinite(wavelength)) {
          const displacement = calculateDisplacement(wavelength, coeffs);
          if (isFinite(displacement)) {
            displacements[`D${sensorIndex}`] = displacement;
          }
        }
      });

      return {
        ...point,
        displacements,
        timestamp: index,
      };
    });
  }, [data, coefficientsMap]);
};
