import { Alert } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { AlertCircle } from 'lucide-react';

import { ChannelSummaryCard } from '../../../entities/sensor/ui/ChannelSummaryCard';
import type { ChannelSummary } from '../hooks/useDashboardChannels';

const CHANNEL_COLORS = [
  '#4f46e5',
  '#e11d48',
  '#059669',
  '#f97316',
  '#8b5cf6',
  '#06b6d4',
  '#ec4899',
  '#14b8a6',
  '#f59e0b',
  '#6366f1',
  '#10b981',
  '#ef4444',
  '#3b82f6',
  '#f43f5e',
  '#a855f7',
  '#84cc16',
];

const COLUMN_CLASS: Record<number, string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  8: 'grid-cols-2 md:grid-cols-4 lg:grid-cols-8',
};

interface ChannelOverviewGridProps {
  channels: ChannelSummary[];
  isConnected: boolean;
  columns?: number;
  visibleChannels?: number[];
}

export const ChannelOverviewGrid = ({
  channels,
  isConnected,
  columns = 4,
  visibleChannels,
}: ChannelOverviewGridProps) => {
  const { t } = useTranslation();

  const shown =
    visibleChannels !== undefined
      ? channels.filter((channel) => visibleChannels.includes(channel.index))
      : channels;

  if (!isConnected) {
    return (
      <Alert
        color="warning"
        variant="flat"
        title={t('dashboard.notConnected')}
        startContent={<AlertCircle className="w-5 h-5" />}
      >
        {t('dashboard.selectPort')}
      </Alert>
    );
  }

  return (
    <div className={`grid gap-3 ${COLUMN_CLASS[columns] ?? COLUMN_CLASS[4]}`}>
      {shown.map((channel) => (
        <ChannelSummaryCard
          key={channel.index}
          index={channel.index}
          power={channel.power}
          wavelength={channel.wavelength}
          values={channel.values}
          status={channel.status}
          alarmMin={channel.alarmMin ?? undefined}
          alarmMax={channel.alarmMax ?? undefined}
          color={CHANNEL_COLORS[channel.index % CHANNEL_COLORS.length]}
        />
      ))}
    </div>
  );
};
