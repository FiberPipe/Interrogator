import { Card, CardBody, CardHeader, Chip, Badge } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import type { SensorConfig } from '../model/types';
import { SENSOR_TYPE_COLORS, SENSOR_TYPE_ICONS } from '../model/constants';

interface SensorCardProps {
  sensor: SensorConfig;
  children?: React.ReactNode;
}

export const SensorCard = ({ sensor, children }: SensorCardProps) => {
  const { t } = useTranslation();
  const icon = SENSOR_TYPE_ICONS[sensor.type];
  const color = SENSOR_TYPE_COLORS[sensor.type];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-2" style={{ borderColor: color + '40' }}>
        <CardHeader className="flex gap-3 pb-3">
          <Badge
            content={sensor.channels.length}
            color="primary"
            size="sm"
            isInvisible={sensor.channels.length === 0}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-2xl"
              style={{ backgroundColor: color + '20' }}
            >
              {icon}
            </div>
          </Badge>
          <div className="flex flex-col flex-1">
            <h4 className="text-base font-semibold">
              {t('sensors.configuration.sensor', { index: sensor.index })}
            </h4>
            <p className="text-sm text-default-500">
              {sensor.type ? t(`sensors.types.${sensor.type}`) : t('sensors.types.none')}
            </p>
          </div>
          {sensor.channels.length > 0 && (
            <Chip size="sm" variant="flat" color="success">
              {t('sensors.configuration.channelsSelected', { count: sensor.channels.length })}
            </Chip>
          )}
        </CardHeader>
        <CardBody className="pt-0">{children}</CardBody>
      </Card>
    </motion.div>
  );
};
