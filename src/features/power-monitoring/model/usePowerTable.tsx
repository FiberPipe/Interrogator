import { useState, useCallback, useEffect } from 'react';
import type { AlarmThresholds } from '../../../entities/power-data/model/types';

export const usePowerTable = () => {
  const [alarmThresholds, setAlarmThresholds] = useState<AlarmThresholds>({});
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка сохранённых порогов
  useEffect(() => {
    const loadThresholds = async () => {
      try {
        const data = await window.appData.getAll();
        if (data?.alarmThresholds) {
          setAlarmThresholds(data.alarmThresholds as AlarmThresholds);
        }
      } catch (err) {
        console.error('[usePowerTable] Load error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadThresholds();
  }, []);

  const updateAlarmThreshold = useCallback(
    async (channelId: number, type: 'min' | 'max', value: string) => {
      const key = `P${channelId}`;
      const numValue = parseFloat(value);

      setAlarmThresholds((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          [type]: isNaN(numValue) ? undefined : numValue,
        },
      }));

      // Сохраняем в appData
      try {
        const newThresholds = {
          ...alarmThresholds,
          [key]: {
            ...alarmThresholds[key],
            [type]: isNaN(numValue) ? undefined : numValue,
          },
        };

        await window.appData.set('alarmThresholds', newThresholds);
      } catch (err) {
        console.error('[usePowerTable] Save error:', err);
      }
    },
    [alarmThresholds]
  );

  const getAlarmThreshold = useCallback(
    (channelId: number, type: 'min' | 'max'): number | undefined => {
      return alarmThresholds[`P${channelId}`]?.[type];
    },
    [alarmThresholds]
  );

  return {
    alarmThresholds,
    isLoading,
    updateAlarmThreshold,
    getAlarmThreshold,
  };
};
