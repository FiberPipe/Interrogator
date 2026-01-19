import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Input, Chip } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { groupDataByWavelengthId } from '../../../entities/sensor-data/model/utils';
import { calculateTemperature } from '../../../entities/sensor-data/model/calculators';
import { FormulaDisplay } from '../../../entities/sensor-data/ui/FormulaDisplay';

interface TemperatureTableProps {
    data: any[];
    inputValues: Record<string, string>;
    onInputChange: (key: string, value: string) => void;
}

export const TemperatureTable = ({ data, inputValues, onInputChange }: TemperatureTableProps) => {
    const { t } = useTranslation();

    const groupedData = useMemo(() => groupDataByWavelengthId(data), [data]);

    const columns = [
        { key: 'id', label: t('monitoring.temperature.columns.id') },
        { key: 'lambda0', label: 'λ₀ (нм)' },
        { key: 'E', label: 'E (°С/нм⁴)' },
        { key: 'D', label: 'D (°С/нм³)' },
        { key: 'C', label: 'C (°С/нм²)' },
        { key: 'B', label: 'B (°С/нм)' },
        { key: 'A', label: 'A (°С)' },
        { key: 'result', label: t('monitoring.temperature.columns.result') },
    ];

    const formula = 'T = E(λ - λ₀)⁴ + D(λ - λ₀)³ + C(λ - λ₀)² + B(λ - λ₀) + A';

    return (
        <div className="space-y-4 w-full">
            <FormulaDisplay formula={formula} />

            <div className="overflow-x-auto">
                <Table aria-label="Temperature monitoring table" className="w-full">
                    <TableHeader columns={columns}>
                        {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
                    </TableHeader>
                    <TableBody items={groupedData}>
                        {(item) => {
                            const coeffs = {
                                lambda0: parseFloat(inputValues[`Temp_λ₀_${item.id}`] || '0'),
                                E: parseFloat(inputValues[`Temp_E_${item.id}`] || '0'),
                                D: parseFloat(inputValues[`Temp_D_${item.id}`] || '0'),
                                C: parseFloat(inputValues[`Temp_C_${item.id}`] || '0'),
                                B: parseFloat(inputValues[`Temp_B_${item.id}`] || '0'),
                                A: parseFloat(inputValues[`Temp_A_${item.id}`] || '0'),
                            };

                            const temperature = calculateTemperature(item.wavelength, coeffs);

                            return (
                                <TableRow key={`temp-${item.id}`}>
                                    <TableCell>
                                        <Chip size="sm" variant="flat" color="primary">
                                            T{item.id}
                                        </Chip>
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            size="sm"
                                            value={inputValues[`Temp_λ₀_${item.id}`] || ''}
                                            onChange={(e) => onInputChange(`Temp_λ₀_${item.id}`, e.target.value)}
                                            variant="bordered"
                                            classNames={{ input: 'text-sm', inputWrapper: 'h-8' }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            size="sm"
                                            value={inputValues[`Temp_E_${item.id}`] || ''}
                                            onChange={(e) => onInputChange(`Temp_E_${item.id}`, e.target.value)}
                                            variant="bordered"
                                            classNames={{ input: 'text-sm', inputWrapper: 'h-8' }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            size="sm"
                                            value={inputValues[`Temp_D_${item.id}`] || ''}
                                            onChange={(e) => onInputChange(`Temp_D_${item.id}`, e.target.value)}
                                            variant="bordered"
                                            classNames={{ input: 'text-sm', inputWrapper: 'h-8' }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            size="sm"
                                            value={inputValues[`Temp_C_${item.id}`] || ''}
                                            onChange={(e) => onInputChange(`Temp_C_${item.id}`, e.target.value)}
                                            variant="bordered"
                                            classNames={{ input: 'text-sm', inputWrapper: 'h-8' }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            size="sm"
                                            value={inputValues[`Temp_B_${item.id}`] || ''}
                                            onChange={(e) => onInputChange(`Temp_B_${item.id}`, e.target.value)}
                                            variant="bordered"
                                            classNames={{ input: 'text-sm', inputWrapper: 'h-8' }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            size="sm"
                                            value={inputValues[`Temp_A_${item.id}`] || ''}
                                            onChange={(e) => onInputChange(`Temp_A_${item.id}`, e.target.value)}
                                            variant="bordered"
                                            classNames={{ input: 'text-sm', inputWrapper: 'h-8' }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-semibold text-primary">
                                            {isFinite(temperature) ? `${temperature.toFixed(2)} °C` : 'N/A'}
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
