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
import { Save, Move, AlertCircle } from 'lucide-react';

import type { RowData } from '../../../ui/shared/types/microcontroller-data';
import { DisplacementFormulaDisplay } from '../../../../entities/displacement';
import { safeToFixed } from '../../../ui/shared/lib';
import { useDisplacementMonitoring } from '../model/useDisplacementMonitoring';

interface DisplacementTableProps {
  data: RowData[];
}

export const DisplacementTable = ({ data }: DisplacementTableProps) => {
  const { t } = useTranslation();
  const { displacementRows, isLoading } = useDisplacementMonitoring(data);

  const columns = [
    { key: 'id', label: t('monitoring.displacement.columns.id'), width: '7%' },
    { key: 'lambda0', label: 'λ₀ (нм)', width: '11%' },
    { key: 'k', label: 'k', width: '11%' },
    { key: 'C', label: 'C (μm/m·°C²)', width: '11%' },
    { key: 'B', label: 'B (μm/m·°C)', width: '11%' },
    { key: 'alpha', label: 'α (μm/m·°C)', width: '11%' },
    { key: 'T', label: 'T (°C)', width: '10%' },
    { key: 'T0', label: 'T₀ (°C)', width: '10%' },
    { key: 'result', label: t('monitoring.displacement.columns.result'), width: '18%' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Spinner size="lg" label={t('common.loading')} />
      </div>
    );
  }

  if (displacementRows.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-default-400 border-2 border-dashed border-default-200 rounded-lg">
        <div className="text-center">
          <div className="text-lg font-medium">{t('monitoring.displacement.noData')}</div>
          <div className="text-sm mt-1">{t('monitoring.displacement.waitingForData')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DisplacementFormulaDisplay />

      <div className="overflow-x-auto">
        <Table
          aria-label="Displacement monitoring table"
          className="w-full"
          isStriped
          removeWrapper
          classNames={{
            th: 'bg-default-100 text-default-700 font-semibold text-xs',
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

          <TableBody items={displacementRows}>
            {(row) => (
              <TableRow key={`disp-${row.id}`}>
                <TableCell>
                  <DisplacementCellId id={row.id} hasCoefficients={row.hasCoefficients} />
                </TableCell>
                <TableCell>
                  <DisplacementCellCoefficient sensorId={row.id} coeffKey="lambda0" />
                </TableCell>
                <TableCell>
                  <DisplacementCellCoefficient sensorId={row.id} coeffKey="k" />
                </TableCell>
                <TableCell>
                  <DisplacementCellCoefficient sensorId={row.id} coeffKey="C" />
                </TableCell>
                <TableCell>
                  <DisplacementCellCoefficient sensorId={row.id} coeffKey="B" />
                </TableCell>
                <TableCell>
                  <DisplacementCellCoefficient sensorId={row.id} coeffKey="alpha" />
                </TableCell>
                <TableCell>
                  <DisplacementCellCoefficient sensorId={row.id} coeffKey="T" />
                </TableCell>
                <TableCell>
                  <DisplacementCellCoefficient sensorId={row.id} coeffKey="T0" />
                </TableCell>
                <TableCell>
                  <DisplacementCellResult
                    sensorId={row.id}
                    displacement={row.displacement}
                    wavelength={row.wavelength}
                    hasCoefficients={row.hasCoefficients}
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

// ==================== Вспомогательные компоненты ====================

const DisplacementCellId = ({ id, hasCoefficients }: { id: number; hasCoefficients: boolean }) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center gap-2">
      <Chip variant="flat" color="secondary" size="sm" className="font-bold">
        D{id}
      </Chip>
      {!hasCoefficients && (
        <Tooltip content={t('monitoring.displacement.noCoefficientsHint')}>
          <AlertCircle className="w-4 h-4 text-warning" />
        </Tooltip>
      )}
    </div>
  );
};

const DisplacementCellCoefficient = ({
  sensorId,
  coeffKey,
}: {
  sensorId: number;
  coeffKey: string;
}) => {
  const [value, setValue] = useState<string>('0');
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const load = async () => {
      const storageKey = `Displacement_${coeffKey}_${sensorId}`;
      const stored = await window.appData.get(storageKey);
      if (stored !== undefined && stored !== null) {
        setValue(String(stored));
      } else if (coeffKey === 'T' || coeffKey === 'T0') {
        setValue('20'); // Комнатная температура
      }
    };
    load();
  }, [sensorId, coeffKey]);

  const handleSave = async () => {
    const storageKey = `Displacement_${coeffKey}_${sensorId}`;
    await window.appData.set(storageKey, value);
    setIsDirty(false);
  };

  const handleChange = (newValue: string) => {
    setValue(newValue);
    setIsDirty(true);
  };

  const stepMap: Record<string, string> = {
    lambda0: '0.001',
    k: '0.01',
    C: '0.0001',
    B: '0.001',
    alpha: '0.0001',
    T: '0.1',
    T0: '0.1',
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
          input: 'text-xs font-mono text-center',
          inputWrapper: 'h-8',
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
          className="min-w-unit-7 w-7 h-7"
        >
          <Save className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
};

const DisplacementCellResult = ({
  displacement,
  wavelength,
  hasCoefficients,
}: {
  sensorId: number;
  displacement: number;
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
                {t('monitoring.displacement.rawWavelength')}
              </div>
              <div className="text-xs">{safeToFixed(wavelength, 6)} nm</div>
            </div>
          }
        >
          <Chip color="default" variant="bordered" size="lg" className="font-mono">
            {t('monitoring.displacement.notConfigured')}
          </Chip>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <Chip
        color="secondary"
        variant="flat"
        size="lg"
        className="font-mono font-semibold"
        startContent={<Move className="w-4 h-4" />}
      >
        {isFinite(displacement) ? safeToFixed(displacement, 2) : '—'} μm/m
      </Chip>
    </div>
  );
};
