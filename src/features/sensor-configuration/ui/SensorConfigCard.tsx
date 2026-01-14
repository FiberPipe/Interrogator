// src/features/sensor-configuration/ui/SensorConfigCard.tsx
import { Divider } from '@heroui/react';
import type { SensorConfig } from '../../../entities/sensor/model/types';
import { SensorCard } from '../../../entities/sensor/ui/SensorCard';
import { SensorTypeSelector } from './SensorTypeSelector';
import { ChannelSelector } from './ChannelSelector';

interface SensorConfigCardProps {
  sensor: SensorConfig;
  usedChannels: string[];
  onTypeChange: (type: any) => void;
  onChannelToggle: (channel: string) => void;
}

export const SensorConfigCard = ({
  sensor,
  usedChannels,
  onTypeChange,
  onChannelToggle,
}: SensorConfigCardProps) => {
  // Защита от undefined
  if (!sensor) {
    console.error('[SensorConfigCard] Sensor is undefined');
    return null;
  }

  return (
    <SensorCard sensor={sensor}>
      <div className="space-y-4">
        <SensorTypeSelector 
          value={sensor.type || ''} 
          onChange={onTypeChange} 
        />
        
        <Divider />
        
        <ChannelSelector
          selectedChannels={sensor.channels || []}
          usedChannels={usedChannels}
          onToggle={onChannelToggle}
        />
      </div>
    </SensorCard>
  );
};
