import { Chip, Button } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

interface ChannelSelectorProps {
  selectedChannels: string[];
  usedChannels: string[];
  onToggle: (channel: string) => void;
  maxChannels?: number;
  isLimitReached?: boolean;
}

export const ChannelSelector = ({
  selectedChannels,
  usedChannels,
  onToggle,
  maxChannels = 4,
  isLimitReached = false,
}: ChannelSelectorProps) => {
  const { t } = useTranslation();

  const channels = Array.from({ length: 16 }, (_, i) => `P${i}`);

  const isChannelDisabled = (channel: string) => {
    const isSelected = selectedChannels.includes(channel);
    const isUsedByOther = usedChannels.includes(channel) && !isSelected;
    const limitReached = !isSelected && isLimitReached;

    return isUsedByOther || limitReached;
  };

  const getChannelVariant = (channel: string) => {
    if (selectedChannels.includes(channel)) return 'solid';
    if (usedChannels.includes(channel)) return 'flat';
    return 'bordered';
  };

  const getChannelColor = (channel: string) => {
    if (selectedChannels.includes(channel)) return 'primary';
    if (usedChannels.includes(channel)) return 'warning';
    return 'default';
  };

  return (
    <div className="space-y-3">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-sm font-medium">
            {t('sensors.channels.available')}
          </span>
          <p className="text-xs text-default-400">
            {t('sensors.channels.selectedCount', {
              count: selectedChannels.length,
              max: maxChannels,
            })}
          </p>
        </div>

        {/* Лимит достигнут */}
        {isLimitReached && (
          <Chip size="sm" color="warning" variant="flat">
            {t('sensors.channels.limitReached')}
          </Chip>
        )}
      </div>

      {/* Сетка каналов */}
      <div className="grid grid-cols-4 gap-2">
        {channels.map((channel, idx) => {
          const isSelected = selectedChannels.includes(channel);
          const isDisabled = isChannelDisabled(channel);
          const isUsedByOther = usedChannels.includes(channel) && !isSelected;

          return (
            <motion.div
              key={channel}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.02 }}
              whileHover={!isDisabled ? { scale: 1.05 } : {}}
              whileTap={!isDisabled ? { scale: 0.95 } : {}}
            >
              <div className="relative">
                <Chip
                  variant={getChannelVariant(channel)}
                  color={getChannelColor(channel)}
                  className={`w-full justify-center cursor-pointer ${
                    isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={() => !isDisabled && onToggle(channel)}
                  size="sm"
                >
                  {channel}
                </Chip>

                {/* Индикатор "In Use" */}
                {isUsedByOther && (
                  <div className="absolute -top-1 -right-1">
                    <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Легенда */}
      <div className="flex flex-wrap gap-3 pt-2 border-t border-default-200">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-primary" />
          <span className="text-xs text-default-600">
            {t('sensors.channels.legend.selected')}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-warning/20 border border-warning" />
          <span className="text-xs text-default-600">
            {t('sensors.channels.legend.inUse')}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded border border-default-300" />
          <span className="text-xs text-default-600">
            {t('sensors.channels.legend.available')}
          </span>
        </div>
      </div>
    </div>
  );
};
