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
  Button,
  Spinner,
  Tooltip,
} from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { Save, Thermometer, AlertCircle } from 'lucide-react';

import type { RowData } from '../../../shared/types/microcontroller-data';
import { FormulaDisplay } from '../../../entities/temperature/ui/FormulaDisplay';
import { safeToFixed } from '../../../shared/lib';
import { useTemperatureMonitoring } from '../model/useTemperatureMonitoring';

interface TemperatureTableProps {
  data: RowData[];
}

export const TemperatureTable = ({ data }: TemperatureTableProps) => {
  const { t } = useTranslation();
  const { temperatureRows, isLoading } = useTemperatureMonitoring(data);

  const columns = [
    { key: 'id', label: t('monitoring.temperature.columns.id'), width: '8%' },
    { key: 'lambda0', label: 'λ₀ (нм)', width: '12%' },
    { key: 'E', label: 'E', width: '12%' },
    { key: 'D', label: 'D', width: '12%' },
    { key: 'C', label: 'C', width: '12%' },
    { key: 'B', label: 'B', width: '12%' },
    { key: 'A', label: 'A', width: '12%' },
    { key: 'result', label: t('monitoring.temperature.columns.result'), width: '20%' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Spinner size="lg" label={t('common.loading')} />
      </div>
    );
  }

  if (temperatureRows.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-default-400 border-2 border-dashed border-default-200 rounded-lg">
        <div className="text-center">
          <div className="text-lg font-medium">{t('monitoring.temperature.noData')}</div>
          <div className="text-sm mt-1">{t('monitoring.temperature.waitingForData')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FormulaDisplay />

      <Table
        aria-label="Temperature monitoring table"
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

        <TableBody items={temperatureRows}>
          {(row) => (
            <TableRow key={`temp-${row.id}`}>
              <TableCell>
                <TemperatureCellId id={row.id} hasCoefficients={row.hasCoefficients} />
              </TableCell>
              <TableCell>
                <TemperatureCellCoefficient sensorId={row.id} coeffKey="lambda0" />
              </TableCell>
              <TableCell>
                <TemperatureCellCoefficient sensorId={row.id} coeffKey="E" />
              </TableCell>
              <TableCell>
                <TemperatureCellCoefficient sensorId={row.id} coeffKey="D" />
              </TableCell>
              <TableCell>
                <TemperatureCellCoefficient sensorId={row.id} coeffKey="C" />
              </TableCell>
              <TableCell>
                <TemperatureCellCoefficient sensorId={row.id} coeffKey="B" />
              </TableCell>
              <TableCell>
                <TemperatureCellCoefficient sensorId={row.id} coeffKey="A" />
              </TableCell>
              <TableCell>
                <TemperatureCellResult
                  sensorId={row.id}
                  temperature={row.temperature}
                  wavelength={row.wavelength}
                  hasCoefficients={row.hasCoefficients}
                />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

// ==================== Вспомогательные компоненты ====================

const TemperatureCellId = ({ id, hasCoefficients }: { id: number; hasCoefficients: boolean }) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center gap-2">
      <Chip variant="flat" color="warning" size="sm" className="font-bold">
        T{id}
      </Chip>
      {!hasCoefficients && (
        <Tooltip content={t('monitoring.temperature.noCoefficientsHint')}>
          <AlertCircle className="w-4 h-4 text-warning" />
        </Tooltip>
      )}
    </div>
  );
};

const TemperatureCellCoefficient = ({
  sensorId,
  coeffKey,
}: {
  sensorId: number;
  coeffKey: string;
}) => {
  const [value, setValue] = useState<string>('0');
  const [isDirty, setIsDirty] = useState(false);

  // Загрузка значения
  useEffect(() => {
    const load = async () => {
      const storageKey = `Temp_${coeffKey}_${sensorId}`;
      const stored = await window.appData.get(storageKey);
      if (stored !== undefined && stored !== null) {
        setValue(String(stored));
      }
    };
    load();
  }, [sensorId, coeffKey]);

  // Сохранение значения
  const handleSave = async () => {
    const storageKey = `Temp_${coeffKey}_${sensorId}`;
    await window.appData.set(storageKey, value);
    setIsDirty(false);
  };

  const handleChange = (newValue: string) => {
    setValue(newValue);
    setIsDirty(true);
  };

  const stepMap: Record<string, string> = {
    lambda0: '0.001',
    E: '0.0001',
    D: '0.0001',
    C: '0.001',
    B: '0.01',
    A: '0.1',
  };

  return (
    <div className="flex items-center gap-1">
      <Input
        type="number"
        size="sm"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        variant="bordered"
        step={stepMap[coeffKey] || '0.001'}
        classNames={{
          input: 'text-sm font-mono text-center',
          inputWrapper: 'h-9',
        }}
      />
      {isDirty && (
        <Button
          size="sm"
          color="primary"
          variant="flat"
          isIconOnly
          onPress={handleSave}
          title="Сохранить"
          className="min-w-unit-8 w-8 h-8"
        >
          <Save className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
};

const TemperatureCellResult = ({
  sensorId,
  temperature,
  wavelength,
  hasCoefficients,
}: {
  sensorId: number;
  temperature: number;
  wavelength: number;
  hasCoefficients: boolean;
}) => {
  const { t } = useTranslation();

  if (!hasCoefficients) {
    return (
      <div className="flex items-center justify-center">
        <Tooltip
          content={
            <div className="px-2 py-1">
              <div className="text-xs font-semibold mb-1">
                {t('monitoring.temperature.rawWavelength')}
              </div>
              <div className="text-xs">{safeToFixed(wavelength, 6)} nm</div>
            </div>
          }
        >
          <Chip color="default" variant="bordered" size="lg" className="font-mono">
            {t('monitoring.temperature.notConfigured')}
          </Chip>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <Chip
        color="warning"
        variant="flat"
        size="lg"
        className="font-mono font-semibold"
        startContent={<Thermometer className="w-4 h-4" />}
      >
        {isFinite(temperature) ? safeToFixed(temperature, 2) : '—'} °C
      </Chip>
    </div>
  );
};
