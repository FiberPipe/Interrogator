import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import {
  createEmptySensor,
  type SensorConfig,
  type SensorType,
} from '../../../entities/sensor/model/types';
import { addDangerToaster, addSuccessToaster } from '../../../shared/ui';
import { appDataApi } from '../../../shared/api/app-data.api';

export const useSensorConfig = () => {
  const { t } = useTranslation();
  const [sensorCount, setSensorCount] = useState<number>(0);
  const [sensors, setSensors] = useState<Record<number, SensorConfig>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Загрузка сохранённой конфигурации
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const data = await appDataApi.getAll();

        if (data?.sensorCount) {
          setSensorCount(data.sensorCount as number);
        }

        if (data?.sensorConfig) {
          setSensors(data.sensorConfig as Record<number, SensorConfig>);
        }
      } catch (err) {
        addDangerToaster('[useSensorConfig] Load error:', JSON.stringify(err));
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

  // Инициализация датчиков при изменении количества
  useEffect(() => {
    if (sensorCount > 0) {
      setSensors((prev) => {
        const newSensors: Record<number, SensorConfig> = {};

        for (let i = 0; i < sensorCount; i++) {
          newSensors[i] = prev[i] || createEmptySensor(i);
        }

        return newSensors;
      });
    }
  }, [sensorCount]);

  const updateSensorCount = useCallback(async (count: number) => {
    setSensorCount(count);
    await appDataApi.set('sensorCount', count);
  }, []);

  const updateSensorType = useCallback((sensorIndex: number, type: SensorType) => {
    setSensors((prev) => ({
      ...prev,
      [sensorIndex]: {
        ...prev[sensorIndex],
        type,
      },
    }));
  }, []);

  // 👇 Новый метод для обновления псевдонима
  const updateSensorAlias = useCallback((sensorIndex: number, alias: string) => {
    setSensors((prev) => ({
      ...prev,
      [sensorIndex]: {
        ...prev[sensorIndex],
        alias,
      },
    }));
  }, []);

  const toggleChannel = useCallback((sensorIndex: number, channel: string) => {
    setSensors((prev) => {
      const currentSensor = prev[sensorIndex];
      const currentChannels = currentSensor?.channels || [];

      // Проверяем, используется ли канал другим датчиком
      const isUsedByOther = Object.entries(prev).some(
        ([idx, sensor]) => Number(idx) !== sensorIndex && sensor.channels.includes(channel),
      );

      if (isUsedByOther) {
        // Отбираем канал у другого датчика
        const newSensors = { ...prev };

        Object.keys(newSensors).forEach((key) => {
          const idx = Number(key);
          if (idx !== sensorIndex) {
            newSensors[idx] = {
              ...newSensors[idx],
              channels: newSensors[idx].channels.filter((ch) => ch !== channel),
            };
          }
        });

        newSensors[sensorIndex] = {
          ...currentSensor,
          channels: [...currentChannels, channel],
        };

        return newSensors;
      }

      // Просто переключаем
      const newChannels = currentChannels.includes(channel)
        ? currentChannels.filter((ch) => ch !== channel)
        : [...currentChannels, channel].sort();

      return {
        ...prev,
        [sensorIndex]: {
          ...currentSensor,
          channels: newChannels,
        },
      };
    });
  }, []);

  const saveConfiguration = useCallback(async () => {
    setIsSaving(true);
    try {
      await appDataApi.patch({
        sensorCount,
        sensorConfig: sensors,
      });

      addSuccessToaster(t('sensors.messages.saved'), t('sensors.messages.savedDescription'));
    } catch (err) {
      addDangerToaster('[useSensorConfig] Save error:', err);
    } finally {
      setIsSaving(false);
    }
  }, [sensorCount, sensors, t]);

  const resetConfiguration = useCallback(() => {
    setSensorCount(0);
    setSensors({});
  }, []);

  const usedChannels = Object.values(sensors).flatMap((sensor) => sensor.channels);

  return {
    sensorCount,
    sensors,
    isLoading,
    isSaving,
    usedChannels,
    updateSensorCount,
    updateSensorType,
    updateSensorAlias, // 👈 Экспортируем новый метод
    toggleChannel,
    saveConfiguration,
    resetConfiguration,
  };
};
