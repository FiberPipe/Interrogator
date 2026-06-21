import { Button, ButtonGroup, Chip, Popover, PopoverContent, PopoverTrigger } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { Settings2 } from 'lucide-react';

import {
  DASHBOARD_CHANNEL_COUNT,
  DASHBOARD_COLUMN_OPTIONS,
} from '../model/useDashboardSettings';
import type { DashboardColumns } from '../model/useDashboardSettings';

interface DashboardSettingsPanelProps {
  columns: DashboardColumns;
  visibleChannels: number[];
  onColumnsChange: (columns: DashboardColumns) => void;
  onToggleChannel: (channel: number) => void;
}

const ALL_CHANNELS = Array.from({ length: DASHBOARD_CHANNEL_COUNT }, (_, i) => i);

export const DashboardSettingsPanel = ({
  columns,
  visibleChannels,
  onColumnsChange,
  onToggleChannel,
}: DashboardSettingsPanelProps) => {
  const { t } = useTranslation();

  return (
    <Popover placement="bottom-end">
      <PopoverTrigger>
        <Button size="sm" variant="flat" startContent={<Settings2 className="w-4 h-4" />}>
          {t('dashboard.settings.title')}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4 gap-4">
        <div className="w-full space-y-2">
          <span className="text-sm font-medium">{t('dashboard.settings.columns')}</span>
          <ButtonGroup size="sm" variant="flat" className="w-full">
            {DASHBOARD_COLUMN_OPTIONS.map((value) => (
              <Button
                key={value}
                color={columns === value ? 'primary' : 'default'}
                onClick={() => onColumnsChange(value)}
                className="flex-1"
              >
                {value}
              </Button>
            ))}
          </ButtonGroup>
        </div>

        <div className="w-full space-y-2">
          <span className="text-sm font-medium">{t('dashboard.settings.channels')}</span>
          <div className="flex flex-wrap gap-1.5">
            {ALL_CHANNELS.map((channel) => {
              const isVisible = visibleChannels.includes(channel);
              return (
                <Chip
                  key={channel}
                  size="sm"
                  variant={isVisible ? 'solid' : 'bordered'}
                  color={isVisible ? 'primary' : 'default'}
                  className="cursor-pointer"
                  onClick={() => onToggleChannel(channel)}
                >
                  {channel}
                </Chip>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
