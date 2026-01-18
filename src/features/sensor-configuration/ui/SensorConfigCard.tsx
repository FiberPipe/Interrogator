import { Divider, Input } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import type { SensorConfig } from '../../../entities/sensor/model/types';
import { MAX_CHANNELS_PER_SENSOR } from '../../../entities/sensor/model/types';
import { SensorCard } from '../../../entities/sensor/ui/SensorCard';
import { SensorTypeSelector } from './SensorTypeSelector';
import { ChannelSelector } from './ChannelSelector';

interface SensorConfigCardProps {
  sensor: SensorConfig;
  usedChannels: string[];
  onTypeChange: (type: any) => void;
  onChannelToggle: (channel: string) => void;
  onAliasChange: (alias: string) => void; // 👈 Новый проп
}

export const SensorConfigCard = ({
  sensor,
  usedChannels,
  onTypeChange,
  onChannelToggle,
  onAliasChange,
}: SensorConfigCardProps) => {
  const { t } = useTranslation();

  if (!sensor) {
    console.error('[SensorConfigCard] Sensor is undefined');
    return null;
  }

  const isChannelLimitReached = sensor.channels.length >= MAX_CHANNELS_PER_SENSOR;

  return (
    <SensorCard sensor={sensor}>
      <div className="space-y-4">
        {/* Псевдоним датчика */}
        <Input
          label={t('sensors.configuration.alias')}
          placeholder={t('sensors.configuration.aliasPlaceholder', { index: sensor.index + 1 })}
          value={sensor.alias || ''}
          onChange={(e) => onAliasChange(e.target.value)}
          variant="bordered"
          size="sm"
          classNames={{
            input: 'text-sm',
            label: 'text-sm font-medium',
          }}
        />

        <Divider />

        {/* Тип датчика */}
        <SensorTypeSelector value={sensor.type || ''} onChange={onTypeChange} />

        <Divider />

        {/* Каналы */}
        <ChannelSelector
          selectedChannels={sensor.channels || []}
          usedChannels={usedChannels}
          onToggle={onChannelToggle}
          maxChannels={MAX_CHANNELS_PER_SENSOR}
          isLimitReached={isChannelLimitReached}
        />
      </div>
    </SensorCard>
  );
};
