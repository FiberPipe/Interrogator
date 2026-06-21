import { Button } from '@heroui/react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { SensorCountInput } from '../../sensor-configuration/ui/SensorCountInput';
import { SensorConfigCard } from '../../sensor-configuration/ui/SensorConfigCard';
import { useSensorConfig } from '../../sensor-configuration/model/useSensorConfig';

export default function SensorConfigStep({ onNext, onBack }: any) {
  const { t } = useTranslation();
  const {
    sensorCount,
    sensors,
    usedChannels,
    updateSensorCount,
    updateSensorType,
    updateSensorAlias,
    toggleChannel,
  } = useSensorConfig();

  const handleNext = () => {
    onNext({
      sensorCount,
      sensorConfig: sensors,
    });
  };

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
        <SensorCountInput value={sensorCount} onChange={updateSensorCount} />

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
                onAliasChange={(alias) => updateSensorAlias(idx, alias)}
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
