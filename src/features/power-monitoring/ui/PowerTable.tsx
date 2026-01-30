import { useState, useEffect } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Chip,
  Tooltip,
  Button,
  Spinner,
} from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, TrendingUp, TrendingDown, Save } from 'lucide-react';

import { safeToFixed } from '../../../ui/shared/lib';
import type { RowData } from '../../../ui/shared/types/microcontroller-data';
import { usePowerMonitoring } from '../model/usePowerMonitoring';
import { checkAlarmStatus } from '../model/parseSensorData';
import type { PowerTableRow } from '../model/usePowerMonitoring';

interface PowerTableProps {
  data: RowData[];
}

export const PowerTable = ({ data }: PowerTableProps) => {
  const { t } = useTranslation();
  const { powerRows, isLoading } = usePowerMonitoring(data);

  const columns = [
    { key: 'id', label: t('monitoring.power.columns.id'), width: '10%' },
    { key: 'rangeMin', label: t('monitoring.power.columns.rangeMin'), width: '15%' },
    { key: 'alarmMin', label: t('monitoring.power.columns.alarmMin'), width: '20%' },
    { key: 'current', label: t('monitoring.power.columns.current'), width: '20%' },
    { key: 'alarmMax', label: t('monitoring.power.columns.alarmMax'), width: '20%' },
    { key: 'rangeMax', label: t('monitoring.power.columns.rangeMax'), width: '15%' },
  ];

  const renderCurrentCell = (row: PowerTableRow) => {
    const status = checkAlarmStatus(row.currentValue, row.alarmMin, row.alarmMax);

    const colorMap = {
      ok: 'success' as const,
      warning: 'warning' as const,
      danger: 'danger' as const,
    };

    const midRange = (row.rangeMin + row.rangeMax) / 2;
    const isAboveMiddle = row.currentValue > midRange;

    const tooltipContent = (
      <div className="px-2 py-1 space-y-1">
        <div className="text-xs">
          <strong>{t('monitoring.power.tooltip.current')}:</strong>{' '}
          {safeToFixed(row.currentValue, 8)}
        </div>
        <div className="text-xs">
          <strong>{t('monitoring.power.tooltip.range')}:</strong> {safeToFixed(row.rangeMin, 6)} -{' '}
          {safeToFixed(row.rangeMax, 6)}
        </div>
        {row.alarmMin !== null && (
          <div className="text-xs text-warning">
            <strong>{t('monitoring.power.tooltip.alarmMin')}:</strong>{' '}
            {safeToFixed(row.alarmMin, 6)}
          </div>
        )}
        {row.alarmMax !== null && (
          <div className="text-xs text-warning">
            <strong>{t('monitoring.power.tooltip.alarmMax')}:</strong>{' '}
            {safeToFixed(row.alarmMax, 6)}
          </div>
        )}
        {status !== 'ok' && (
          <div className="text-xs font-semibold text-danger mt-1">
            ⚠️{' '}
            {status === 'danger'
              ? t('monitoring.power.tooltip.alarmTriggered')
              : t('monitoring.power.tooltip.alarmWarning')}
          </div>
        )}
      </div>
    );

    return (
      <Tooltip content={tooltipContent} delay={300}>
        <div className="flex items-center justify-center gap-2">
          <Chip
            color={colorMap[status]}
            variant={status === 'ok' ? 'flat' : 'solid'}
            size="lg"
            className="font-mono font-semibold"
            startContent={
              status !== 'ok' ? (
                <AlertTriangle className="w-4 h-4" />
              ) : isAboveMiddle ? (
                <TrendingUp className="w-3 h-3 opacity-50" />
              ) : (
                <TrendingDown className="w-3 h-3 opacity-50" />
              )
            }
          >
            {safeToFixed(row.currentValue, 6)}
          </Chip>
        </div>
      </Tooltip>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Spinner size="lg" label={t('common.loading')} />
      </div>
    );
  }

  if (powerRows.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-default-400 border-2 border-dashed border-default-200 rounded-lg">
        <div className="text-center">
          <div className="text-lg font-medium">{t('monitoring.power.noData')}</div>
          <div className="text-sm mt-1">{t('monitoring.power.waitingForData')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Table
        aria-label="Power monitoring table"
        className="w-full"
        isStriped
        removeWrapper
        classNames={{
          th: 'bg-default-100 text-default-700 font-semibold',
          td: 'py-3',
        }}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.key} width={column.width} align="center">
              {column.label}
            </TableColumn>
          )}
        </TableHeader>

        <TableBody items={powerRows}>
          {(row) => (
            <TableRow key={`power-row-${row.id}`}>
              <TableCell>
                <div className="flex items-center justify-center">
                  <Chip variant="flat" color="primary" size="sm" className="font-bold">
                    {row.channelName}
                  </Chip>
                </div>
              </TableCell>

              <TableCell>
                <div className="text-center">
                  <span className="font-mono text-sm text-default-600">
                    {safeToFixed(row.rangeMin, 6)}
                  </span>
                </div>
              </TableCell>

              <TableCell>
                <PowerAlarmInput channelId={row.id} type="min" />
              </TableCell>

              <TableCell>{renderCurrentCell(row)}</TableCell>

              <TableCell>
                <PowerAlarmInput channelId={row.id} type="max" />
              </TableCell>

              <TableCell>
                <div className="text-center">
                  <span className="font-mono text-sm text-default-600">
                    {safeToFixed(row.rangeMax, 6)}
                  </span>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

// Компонент ввода алармов
const PowerAlarmInput = ({ channelId, type }: { channelId: number; type: 'min' | 'max' }) => {
  const { t } = useTranslation();
  const [value, setValue] = useState<string>('');
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const load = async () => {
      const storageKey = `power${channelId}_${type}`;
      const stored = await window.appData.get(storageKey);
      if (stored !== undefined && stored !== null) {
        setValue(String(stored));
      }
    };
    load();
  }, [channelId, type]);

  const handleSave = async () => {
    const storageKey = `power${channelId}_${type}`;
    await window.appData.set(storageKey, value);
    setIsDirty(false);
  };

  const handleChange = (newValue: string) => {
    setValue(newValue);
    setIsDirty(true);
  };

  return (
    <div className="flex items-center gap-1">
      <Input
        type="number"
        size="sm"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        variant="bordered"
        placeholder={t(`monitoring.power.placeholder.${type}`)}
        step="0.000001"
        classNames={{
          input: 'text-sm font-mono text-center',
          inputWrapper: 'h-10',
        }}
      />
      {isDirty && (
        <Button
          size="sm"
          color="primary"
          variant="flat"
          isIconOnly
          onPress={handleSave}
          title={t('common.save')}
          className="min-w-unit-8 w-8 h-8"
        >
          <Save className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
};
