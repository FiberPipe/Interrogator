import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
} from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

import type { GroupedWavelengthItem } from '../../../entities/sensor-data/model/types';
import { calculateDisplacement } from '../../../entities/sensor-data/model/utils';
import { FormulaDisplay } from '../../../entities/sensor-data/ui/FormulaDisplay';

interface DisplacementTableProps {
  data: GroupedWavelengthItem[];
  inputValues: Record<string, string>;
  onInputChange: (key: string, value: string) => void;
}

export const DisplacementTable = ({ data, inputValues, onInputChange }: DisplacementTableProps) => {
  const { t } = useTranslation();

  const columns = [
    { key: 'id', label: t('monitoring.displacement.columns.id') },
    { key: 'lambda0', label: 'λ₀ (нм)' },
    { key: 'k', label: 'k' },
    { key: 'C', label: 'C (мкм/(м·°C²))' },
    { key: 'B', label: 'B (мкм/(м·°C))' },
    { key: 'alpha', label: 'α (мкм/(м·°C))' },
    { key: 'T', label: 'T (°C)' },
    { key: 'T0', label: 'T₀ (°C)' },
    { key: 'result', label: t('monitoring.displacement.columns.result') },
  ];

  const formula = 'ε = (10⁶ · (λ - λ₀)) / (k · λ₀) - C(T² - T₀²) - (B + α)(T - T₀)';

  const calculateResult = useMemo(
    () => (item: GroupedWavelengthItem) => {
      const coeffs = {
        lambda0: parseFloat(inputValues[`Displacement_lambda0_${item.id}`] || '0'),
        k: parseFloat(inputValues[`Displacement_k_${item.id}`] || '0'),
        C: parseFloat(inputValues[`Displacement_C_${item.id}`] || '0'),
        B: parseFloat(inputValues[`Displacement_B_${item.id}`] || '0'),
        alpha: parseFloat(inputValues[`Displacement_alpha_${item.id}`] || '0'),
        T: parseFloat(inputValues[`Displacement_T_${item.id}`] || '0'),
        T0: parseFloat(inputValues[`Displacement_T0_${item.id}`] || '0'),
      };

      return calculateDisplacement(item.wavelength, coeffs);
    },
    [inputValues],
  );

  return (
    <div className="space-y-4">
      <FormulaDisplay formula={formula} />

      <div className="overflow-x-auto">
        <Table aria-label="Displacement monitoring table" className="w-full">
          <TableHeader columns={columns}>
            {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
          </TableHeader>
          <TableBody items={data}>
            {(item) => (
              <TableRow key={`disp-${item.id}`}>
                <TableCell>Disp_{item.id}</TableCell>
                {['lambda0', 'k', 'C', 'B', 'alpha', 'T', 'T0'].map((field) => (
                  <TableCell key={field}>
                    <Input
                      type="number"
                      size="sm"
                      value={inputValues[`Displacement_${field}_${item.id}`] || ''}
                      onChange={(e) =>
                        onInputChange(`Displacement_${field}_${item.id}`, e.target.value)
                      }
                      variant="bordered"
                      classNames={{ input: 'text-sm', inputWrapper: 'h-8' }}
                    />
                  </TableCell>
                ))}
                <TableCell>
                  <span className="font-semibold text-primary">
                    {calculateResult(item).toFixed(2)} мкм/м
                  </span>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
