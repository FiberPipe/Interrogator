import { Checkbox, Chip } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AVAILABLE_CHANNELS } from '../../../entities/sensor/model/constants';

interface ChannelSelectorProps {
    selectedChannels: string[];
    usedChannels: string[];
    onToggle: (channel: string) => void;
}

export const ChannelSelector = ({
    selectedChannels,
    usedChannels,
    onToggle,
}: ChannelSelectorProps) => {
    const { t } = useTranslation();

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t('sensors.configuration.channels')}</span>
                {selectedChannels.length > 0 && (
                    <Chip size="sm" color="primary" variant="flat">
                        {selectedChannels.length} / 16
                    </Chip>
                )}
            </div>

            <div className="grid grid-cols-4 gap-2">
                {AVAILABLE_CHANNELS.map((channel, idx) => {
                    const isSelected = selectedChannels.includes(channel);
                    const isUsedByOther = usedChannels.includes(channel) && !isSelected;

                    return (
                        <motion.div
                            key={channel}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.02 }}
                        >
                            <Checkbox
                                isSelected={isSelected}
                                onChange={() => onToggle(channel)}
                                className={isUsedByOther ? 'opacity-50' : ''}
                            >
                                <div className="flex items-center gap-1">
                                    {channel}
                                    {isUsedByOther && (
                                        <Chip size="sm" color="warning" variant="dot" className="scale-75">
                                            {t('sensors.channels.inUse')}
                                        </Chip>
                                    )}
                                </div>
                            </Checkbox>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};
