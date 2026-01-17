import { useState, useEffect } from 'react';
import { Button } from '@heroui/react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { SensorCountInput } from '../../sensor-configuration/ui/SensorCountInput';
import { SensorConfigCard } from '../../sensor-configuration/ui/SensorConfigCard';
import { createEmptySensor, type SensorConfig } from '../../../entities/sensor/model/types';

export default function SensorConfigStep({ onNext, onBack }: any) {
  const { t } = useTranslation();
  const [sensorCount, setSensorCount] = useState<number>(0);
  const [sensors, setSensors] = useState<Record<number, SensorConfig>>({});

  useEffect(() => {
    if (sensorCount > 0) {
      setSensors((prev) => {
        const newSensors: Record<number, SensorConfig> = {};

        for (let i = 0; i < sensorCount; i++) {
          newSensors[i] = prev[i] || createEmptySensor(i);
        }

        return newSensors;
      });
    } else {
      setSensors({});
    }
  }, [sensorCount]);

  const updateSensorType = (sensorIndex: number, type: any) => {
    setSensors((prev) => ({
      ...prev,
      [sensorIndex]: {
        ...prev[sensorIndex],
        type,
      },
    }));
  };

  const toggleChannel = (sensorIndex: number, channel: string) => {
    setSensors((prev) => {
      const currentSensor = prev[sensorIndex];
      const currentChannels = currentSensor?.channels || [];

      // Проверяем, используется ли канал другим датчиком
      const isUsedByOther = Object.entries(prev).some(
        ([idx, sensor]) => Number(idx) !== sensorIndex && sensor.channels.includes(channel)
      );

      if (isUsedByOther) {
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
  };

  const handleNext = () => {
    onNext({
      sensorCount,
      sensorConfig: sensors,
    });
  };

  const usedChannels = Object.values(sensors).flatMap((sensor) => sensor.channels);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">{t('onboarding.sensors.title')}</h2>
        <p className="text-sm text-default-500">{t('onboarding.sensors.subtitle')}</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <SensorCountInput value={sensorCount} onChange={setSensorCount} />

        {sensorCount > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto p-1"
          >
            {Array.from({ length: sensorCount }, (_, idx) => (
              <SensorConfigCard
                key={idx}
                sensor={sensors[idx]}
                usedChannels={usedChannels}
                onTypeChange={(type) => updateSensorType(idx, type)}
                onChannelToggle={(channel) => toggleChannel(idx, channel)}
              />
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Навигация */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="light" onPress={onBack}>
          {t('common.back')}
        </Button>

        <Button color="primary" onPress={handleNext}>
          {t('common.next')}
        </Button>
      </div>
    </div>
  );
}
