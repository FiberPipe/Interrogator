import { Chip, Button } from '@heroui/react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface ChartLegendProps {
  channels: number[];
  selectedChannels: number[];
  colors: string[];
  onToggle: (channel: number) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export const ChartLegend = ({
  channels,
  selectedChannels,
  colors,
  onToggle,
  onSelectAll,
  onDeselectAll,
}: ChartLegendProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-default-600">
          {t('charts.info.channels')}: {selectedChannels.length}/{channels.length}
        </span>
        <div className="flex gap-2">
          <Button size="sm" variant="flat" onPress={onSelectAll}>
            {t('charts.controls.selectAll')}
          </Button>
          <Button size="sm" variant="flat" onPress={onDeselectAll}>
            {t('charts.controls.deselectAll')}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {channels.map((channel, idx) => {
          const isSelected = selectedChannels.includes(channel);
          return (
            <motion.div key={channel} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Chip
                variant={isSelected ? 'solid' : 'bordered'}
                color={isSelected ? 'primary' : 'default'}
                className="cursor-pointer"
                onClick={() => onToggle(channel)}
                style={{
                  backgroundColor: isSelected ? colors[idx] : undefined,
                  borderColor: colors[idx],
                }}
              >
                P{channel}
              </Chip>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
