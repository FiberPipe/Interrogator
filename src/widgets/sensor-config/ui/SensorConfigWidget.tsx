import { Card, CardBody, CardHeader, Button, Alert, Divider, Spinner } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, RotateCcw, Settings2, AlertCircle } from 'lucide-react';

import { SensorConfigCard, SensorCountInput } from '../../../features';
import { useSensorConfig } from '../../../features/sensor-configuration/model/useSensorConfig';

export const SensorConfigWidget = () => {
  const { t } = useTranslation();
  const {
    sensorCount,
    sensors,
    isLoading,
    isSaving,
    usedChannels,
    updateSensorCount,
    updateSensorType,
    updateSensorAlias,
    toggleChannel,
    saveConfiguration,
    resetConfiguration,
  } = useSensorConfig();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-success-100 dark:bg-success-900/30">
            <Settings2 className="w-6 h-6 text-success" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{t('sensors.title')}</h2>
            <p className="text-sm text-default-500">{t('sensors.subtitle')}</p>
          </div>
        </div>
      </motion.div>

      <Divider />

      <SensorCountInput value={sensorCount} onChange={updateSensorCount} />

      <AnimatePresence mode="wait">
        {sensorCount > 0 ? (
          <motion.div
            key="config"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">{t('sensors.configuration.title')}</h3>
              </CardHeader>
              <Divider />
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>
              </CardBody>
            </Card>

            <div className="flex gap-3 justify-end">
              <Button
                variant="flat"
                color="warning"
                startContent={<RotateCcw className="w-4 h-4" />}
                onPress={resetConfiguration}
              >
                {t('sensors.actions.reset')}
              </Button>
              <Button
                color="primary"
                startContent={<Save className="w-4 h-4" />}
                onPress={saveConfiguration}
                isLoading={isSaving}
              >
                {t('sensors.actions.save')}
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Alert
              color="warning"
              variant="flat"
              title={t('sensors.messages.noSensors')}
              startContent={<AlertCircle className="w-5 h-5" />}
            >
              {t('sensors.messages.noSensorsDescription')}
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
