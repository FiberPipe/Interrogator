import { Card, CardBody, Chip } from '@heroui/react';
import { useTranslation } from 'react-i18next';

import { PowerSparkline } from '../../power-data/ui/PowerSparkline';

export type ChannelStatus = 'ok' | 'warning' | 'danger' | 'idle';

export interface ChannelSummaryCardProps {
  index: number;
  power: number;
  wavelength: number;
  values: number[];
  status: ChannelStatus;
  alarmMin?: number;
  alarmMax?: number;
  color?: string;
}

const STATUS_BORDER: Record<ChannelStatus, string> = {
  ok: 'border-success/40',
  warning: 'border-warning/60',
  danger: 'border-danger/70',
  idle: 'border-default-200',
};

const STATUS_CHIP: Record<ChannelStatus, 'success' | 'warning' | 'danger' | 'default'> = {
  ok: 'success',
  warning: 'warning',
  danger: 'danger',
  idle: 'default',
};

export const ChannelSummaryCard = ({
  index,
  power,
  wavelength,
  values,
  status,
  alarmMin,
  alarmMax,
  color = '#3b82f6',
}: ChannelSummaryCardProps) => {
  const { t } = useTranslation();
  const hasData = values.length > 0;

  return (
    <Card shadow="sm" className={`border-2 ${STATUS_BORDER[status]} transition-colors`}>
      <CardBody className="gap-2 p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-default-600">
            {t('dashboard.channel.label', { index })}
          </span>
          <Chip size="sm" variant="flat" color={STATUS_CHIP[status]}>
            {t(`dashboard.status.${status}`)}
          </Chip>
        </div>

        <div className="flex items-end justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-xs text-default-400">{t('dashboard.channel.power')}</span>
            <span className="text-lg font-bold text-primary leading-tight">
              {hasData ? power.toFixed(3) : '—'}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-default-400">{t('dashboard.channel.wavelength')}</span>
            <span className="text-sm font-medium text-secondary leading-tight">
              {wavelength > 0 ? wavelength.toFixed(3) : '—'}
            </span>
          </div>
        </div>

        <div className="flex justify-center pt-1">
          <PowerSparkline
            values={values}
            color={color}
            width={160}
            height={36}
            alarmMin={alarmMin}
            alarmMax={alarmMax}
          />
        </div>
      </CardBody>
    </Card>
  );
};
