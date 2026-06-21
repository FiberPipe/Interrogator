import { useState, useEffect, memo } from 'react';
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
import { AlertTriangle, Waves, Save } from 'lucide-react';

import { safeToFixed } from '../../../shared/lib';
import type { RowData } from '../../../shared/types/microcontroller-data';
import type { WavelengthTableRow } from '..';
import { useWavelengthMonitoring, checkAlarmStatus } from '..';
import { appDataApi } from '../../../shared/api/app-data.api';

interface WavelengthTableProps {
  data: RowData[];
}

export const WavelengthTable = ({ data }: WavelengthTableProps) => {
  const { t } = useTranslation();
  const { wavelengthRows, isLoading } = useWavelengthMonitoring(data);

  const columns = [
    { key: 'id', label: t('monitoring.wavelength.columns.id'), width: '10%' },
    { key: 'rangeMin', label: t('monitoring.wavelength.columns.rangeMin'), width: '15%' },
    { key: 'alarmMin', label: t('monitoring.wavelength.columns.alarmMin'), width: '20%' },
    { key: 'current', label: t('monitoring.wavelength.columns.current'), width: '20%' },
    { key: 'alarmMax', label: t('monitoring.wavelength.columns.alarmMax'), width: '20%' },
    { key: 'rangeMax', label: t('monitoring.wavelength.columns.rangeMax'), width: '15%' },
  ];

  // Рендер ячейки с текущим значением (с подсветкой)
  const renderCurrentCell = (row: WavelengthTableRow) => {
    const status = checkAlarmStatus(row.currentValue, row.alarmMin, row.alarmMax);

    const colorMap = {
      ok: 'success' as const,
      warning: 'warning' as const,
      danger: 'danger' as const,
    };

    const tooltipContent = (
      <div className="px-2 py-1 space-y-1">
        <div className="text-xs">
          <strong>{t('monitoring.wavelength.tooltip.current')}:</strong>{' '}
          {safeToFixed(row.currentValue, 8)} nm
        </div>
        <div className="text-xs">
          <strong>{t('monitoring.wavelength.tooltip.range')}:</strong>{' '}
          {safeToFixed(row.rangeMin, 6)} - {safeToFixed(row.rangeMax, 6)} nm
        </div>
        {row.alarmMin !== null && (
          <div className="text-xs text-warning">
            <strong>{t('monitoring.wavelength.tooltip.alarmMin')}:</strong>{' '}
            {safeToFixed(row.alarmMin, 6)} nm
          </div>
        )}
        {row.alarmMax !== null && (
          <div className="text-xs text-warning">
            <strong>{t('monitoring.wavelength.tooltip.alarmMax')}:</strong>{' '}
            {safeToFixed(row.alarmMax, 6)} nm
          </div>
        )}
        {status !== 'ok' && (
          <div className="text-xs font-semibold text-danger mt-1">
            ⚠️{' '}
            {status === 'danger'
              ? t('monitoring.wavelength.tooltip.alarmTriggered')
              : t('monitoring.wavelength.tooltip.alarmWarning')}
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
              ) : (
                <Waves className="w-3 h-3 opacity-50" />
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

  if (wavelengthRows.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-default-400 border-2 border-dashed border-default-200 rounded-lg">
        <div className="text-center">
          <div className="text-lg font-medium">{t('monitoring.wavelength.noData')}</div>
          <div className="text-sm mt-1">{t('monitoring.wavelength.waitingForData')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Table
        aria-label="Wavelength monitoring table"
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

        <TableBody items={wavelengthRows}>
          {(row) => (
            <TableRow key={`wavelength-row-${row.id}`}>
              {/* ID */}
              <TableCell>
                <div className="flex items-center justify-center">
                  <Chip variant="flat" color="secondary" size="sm" className="font-bold">
                    λ{row.id}
                  </Chip>
                </div>
              </TableCell>

              {/* Range Min */}
              <TableCell>
                <div className="text-center">
                  <span className="font-mono text-sm text-default-600">
                    {safeToFixed(row.rangeMin, 6)}
                  </span>
                </div>
              </TableCell>

              {/* Alarm Min (input) */}
              <TableCell>
                <WavelengthAlarmInput sensorId={row.id} type="min" />
              </TableCell>

              {/* Current Value (с подсветкой) */}
              <TableCell>{renderCurrentCell(row)}</TableCell>

              {/* Alarm Max (input) */}
              <TableCell>
                <WavelengthAlarmInput sensorId={row.id} type="max" />
              </TableCell>

              {/* Range Max */}
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

// ==================== Компонент ввода алармов ====================

const WavelengthAlarmInput = memo(({ sensorId, type }: { sensorId: number; type: 'min' | 'max' }) => {
  const { t } = useTranslation();
  const [value, setValue] = useState<string>('');
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const load = async () => {
      const storageKey = `wavelength${sensorId}_${type}`;
      const stored = await appDataApi.get(storageKey);
      if (stored !== undefined && stored !== null) {
        setValue(String(stored));
      }
    };
    load();
  }, [sensorId, type]);

  const handleSave = async () => {
    const storageKey = `wavelength${sensorId}_${type}`;
    await appDataApi.set(storageKey, value);
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
        placeholder={t(`monitoring.wavelength.placeholder.${type}`)}
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
});
