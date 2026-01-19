import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Input, Chip } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { groupDataByWavelengthId } from '../../../entities/sensor-data/model/utils';
import { calculateDisplacement } from '../../../entities/sensor-data/model/calculators';
import { FormulaDisplay } from '../../../entities/sensor-data/ui/FormulaDisplay';

interface DisplacementTableProps {
  data: any[];
  inputValues: Record<string, string>;
  onInputChange: (key: string, value: string) => void;
}

export const DisplacementTable = ({ data, inputValues, onInputChange }: DisplacementTableProps) => {
  const { t } = useTranslation();

  const groupedData = useMemo(() => groupDataByWavelengthId(data), [data]);

  const columns = [
    { key: 'id', label: t('monitoring.displacement.columns.id') },
    { key: 'lambda0', label: 'λ₀ (нм)' },
    { key: 'k', label: 'k' },
    { key: 'C', label: 'C' },
    { key: 'B', label: 'B' },
    { key: 'alpha', label: 'α' },
    { key: 'T', label: 'T (°C)' },
    { key: 'T0', label: 'T₀ (°C)' },
    { key: 'result', label: t('monitoring.displacement.columns.result') },
  ];

  const formula = 'ε = (10⁶ · (λ - λ₀)) / (k · λ₀) - C(T² - T₀²) - (B + α)(T - T₀)';

  return (
    <div className="space-y-4 w-full">
      <FormulaDisplay formula={formula} />

      <div className="overflow-x-auto">
        <Table aria-label="Displacement monitoring table" className="w-full">
          <TableHeader columns={columns}>
            {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
          </TableHeader>
          <TableBody items={groupedData}>
            {(item) => {
              const coeffFields = ['lambda0', 'k', 'C', 'B', 'alpha', 'T', 'T0'];
              const coeffs = {
                lambda0: parseFloat(inputValues[`Displacement_lambda0_${item.id}`] || '0'),
                k: parseFloat(inputValues[`Displacement_k_${item.id}`] || '0'),
                C: parseFloat(inputValues[`Displacement_C_${item.id}`] || '0'),
                B: parseFloat(inputValues[`Displacement_B_${item.id}`] || '0'),
                alpha: parseFloat(inputValues[`Displacement_alpha_${item.id}`] || '0'),
                T: parseFloat(inputValues[`Displacement_T_${item.id}`] || '0'),
                T0: parseFloat(inputValues[`Displacement_T0_${item.id}`] || '0'),
              };

              const displacement = calculateDisplacement(item.wavelength, coeffs);

              return (
                <TableRow key={`disp-${item.id}`}>
                  <TableCell>
                    <Chip size="sm" variant="flat" color="primary">
                      D{item.id}
                    </Chip>
                  </TableCell>
                  {coeffFields.map((field) => (
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
                      {isFinite(displacement) ? `${displacement.toFixed(2)} μm/m` : 'N/A'}
                    </span>
                  </TableCell>
                </TableRow>
              );
            }}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
