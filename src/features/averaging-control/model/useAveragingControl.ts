// src/features/averaging-control/model/useAveragingControl.ts

import { useCallback, useEffect, useRef, useState } from 'react';

import { serialApi } from '../../../shared/api/serial.api';

export const AVG_MIN = 0.1;
export const AVG_MAX = 30.0;
export const AVG_DEFAULT = 1.0;

// Короткий дебаунс: только чтобы не заваливать stdin при перетаскивании
// слайдера. Сам python применяет новый темп сразу (сбрасывает окно).
const APPLY_DEBOUNCE_MS = 100;

const clamp = (value: number): number => Math.max(AVG_MIN, Math.min(value, AVG_MAX));

/**
 * Управление окном усреднения по времени (avg_sec) живьём через serial-мост.
 * Значение сохраняется в main-процессе (app-data) при каждом применении.
 */
export const useAveragingControl = () => {
  const [avgSec, setAvgSec] = useState<number>(AVG_DEFAULT);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Загрузка текущего значения при монтировании.
  useEffect(() => {
    let cancelled = false;

    const load = async (): Promise<void> => {
      const value = await serialApi.getAveraging();
      if (!cancelled) {
        setAvgSec(clamp(value));
        setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
      if (debounceRef.current !== null) clearTimeout(debounceRef.current);
    };
  }, []);

  const apply = useCallback((value: number): void => {
    void serialApi.setAveraging(value);
  }, []);

  /** Изменить значение с дебаунсом отправки в мост. */
  const change = useCallback(
    (value: number): void => {
      const next = clamp(value);
      setAvgSec(next);

      if (debounceRef.current !== null) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => apply(next), APPLY_DEBOUNCE_MS);
    },
    [apply],
  );

  return {
    avgSec,
    loading,
    min: AVG_MIN,
    max: AVG_MAX,
    setAvgSec: change,
  };
};
