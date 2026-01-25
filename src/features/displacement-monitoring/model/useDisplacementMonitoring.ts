import { useState, useEffect, useCallback, useMemo } from 'react';

import type { DisplacementCoefficients } from '../../../entities/displacement';
import { calculateDisplacement } from '../../../entities/displacement';
import type { RowData } from '../../../shared/types/microcontroller-data';

export interface DisplacementTableRow {
  id: number;
  wavelength: number;
  displacement: number;
  coefficients: DisplacementCoefficients;
  hasCoefficients: boolean;
}

const DEFAULT_COEFFICIENTS: DisplacementCoefficients = {
  lambda0: 0,
  k: 0,
  C: 0,
  B: 0,
  alpha: 0,
  T: 20, // Комнатная температура по умолчанию
  T0: 20,
};

/**
 * Главный хук для фичи мониторинга смещения
 */
export const useDisplacementMonitoring = (data: RowData[]) => {
  const [coefficientsMap, setCoefficientsMap] = useState<Record<number, DisplacementCoefficients>>(
    {},
  );
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка всех коэффициентов при монтировании
  useEffect(() => {
    const loadAllCoefficients = async () => {
      setIsLoading(true);
      try {
        const loaded: Record<number, DisplacementCoefficients> = {};

        for (let sensorId = 0; sensorId < 16; sensorId++) {
          const keys: Array<keyof DisplacementCoefficients> = [
            'lambda0',
            'k',
            'C',
            'B',
            'alpha',
            'T',
            'T0',
          ];

          const coeffs: Partial<DisplacementCoefficients> = {};

          await Promise.all(
            keys.map(async (key) => {
              const storageKey = `Displacement_${key}_${sensorId}`;
              const value = await window.appData.get(storageKey);

              // Для температур используем комнатную по умолчанию
              if ((key === 'T' || key === 'T0') && (value === undefined || value === null)) {
                coeffs[key] = 20;
              } else {
                coeffs[key] = value !== undefined && value !== null ? Number(value) : 0;
              }
            }),
          );

          loaded[sensorId] = coeffs as DisplacementCoefficients;
        }

        setCoefficientsMap(loaded);
      } catch (error) {
        console.error('Failed to load displacement coefficients:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllCoefficients();
  }, []);

  // Обновление коэффициентов для конкретного датчика
  const updateSensorCoefficients = useCallback(
    (sensorId: number, coefficients: DisplacementCoefficients) => {
      setCoefficientsMap((prev) => ({
        ...prev,
        [sensorId]: coefficients,
      }));
    },
    [],
  );

  // Вычисленные смещения
  const displacementRows: DisplacementTableRow[] = useMemo(() => {
    if (data.length === 0) return [];

    const latestData = data[data.length - 1];
    if (!latestData?.wavelengths) return [];

    const rows: DisplacementTableRow[] = [];

    Object.keys(latestData.wavelengths).forEach((key) => {
      const match = key.match(/^wavelength(\d+)$/);
      if (!match) return;

      const sensorId = parseInt(match[1], 10);
      const wavelength = latestData.wavelengths[key as keyof typeof latestData.wavelengths];

      if (wavelength === undefined || isNaN(wavelength) || !isFinite(wavelength)) return;

      const coeffs = coefficientsMap[sensorId] || DEFAULT_COEFFICIENTS;

      // Проверяем наличие критичных коэффициентов
      const hasCoefficients =
        coeffs.lambda0 !== 0 && coeffs.k !== 0 && isFinite(coeffs.lambda0) && isFinite(coeffs.k);

      const displacement = hasCoefficients ? calculateDisplacement(wavelength, coeffs) : 0;

      rows.push({
        id: sensorId,
        wavelength,
        displacement,
        coefficients: coeffs,
        hasCoefficients,
      });
    });

    return rows.sort((a, b) => a.id - b.id);
  }, [data, coefficientsMap]);

  return {
    displacementRows,
    coefficientsMap,
    updateSensorCoefficients,
    isLoading,
  };
};
