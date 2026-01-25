import { useState, useEffect, useCallback } from 'react';

import type { TemperatureCoefficients } from '../../../entities/temperature';
import { addDangerToaster, addSuccessToaster } from '../../../shared/ui';

const DEFAULT_COEFFICIENTS: TemperatureCoefficients = {
  lambda0: 0,
  E: 0,
  D: 0,
  C: 0,
  B: 0,
  A: 0,
};

/**
 * Хук для управления коэффициентами температурного датчика
 */
export const useTemperatureCoefficients = (sensorId: number) => {
  const [coefficients, setCoefficients] = useState<TemperatureCoefficients>(DEFAULT_COEFFICIENTS);
  const [isLoading, setIsLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);

  // Загрузка из appData при монтировании
  useEffect(() => {
    const loadCoefficients = async () => {
      setIsLoading(true);
      try {
        const keys: Array<keyof TemperatureCoefficients> = ['lambda0', 'E', 'D', 'C', 'B', 'A'];

        const loaded: Partial<TemperatureCoefficients> = {};

        await Promise.all(
          keys.map(async (key) => {
            const storageKey = `Temp_${key}_${sensorId}`;
            const value = await window.appData.get(storageKey);
            if (value !== undefined && value !== null) {
              loaded[key] = Number(value);
            }
          }),
        );

        setCoefficients((prev) => ({ ...prev, ...loaded }));
      } catch (error) {
        addDangerToaster('Ошибка загрузки коэффициентов');
      } finally {
        setIsLoading(false);
      }
    };

    loadCoefficients();
  }, [sensorId]);

  // Обновление одного коэффициента
  const updateCoefficient = useCallback((key: keyof TemperatureCoefficients, value: number) => {
    setCoefficients((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  }, []);

  // Сохранение всех коэффициентов
  const saveCoefficients = useCallback(async () => {
    try {
      const keys: Array<keyof TemperatureCoefficients> = ['lambda0', 'E', 'D', 'C', 'B', 'A'];

      await Promise.all(
        keys.map((key) => {
          const storageKey = `Temp_${key}_${sensorId}`;
          return window.appData.set(storageKey, coefficients[key]);
        }),
      );

      setIsDirty(false);
      addSuccessToaster('Коэффициенты сохранены');
    } catch (error) {
      console.error(`Failed to save coefficients for sensor ${sensorId}:`, error);
      addDangerToaster('Ошибка сохранения коэффициентов');
    }
  }, [sensorId, coefficients]);

  // Сброс к значениям по умолчанию
  const resetCoefficients = useCallback(() => {
    setCoefficients(DEFAULT_COEFFICIENTS);
    setIsDirty(true);
  }, []);

  return {
    coefficients,
    updateCoefficient,
    saveCoefficients,
    resetCoefficients,
    isLoading,
    isDirty,
  };
};
