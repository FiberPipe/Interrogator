import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Input } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import type { GroupedPowerItem } from '../../../entities/sensor-data/model/types';

interface PowerTableProps {
  data: GroupedPowerItem[];
  inputValues: Record<string, string>;
  onInputChange: (key: string, value: string) => void;
}

export const PowerTable = ({ data, inputValues, onInputChange }: PowerTableProps) => {
  const { t } = useTranslation();

  const columns = [
    { key: 'id', label: t('monitoring.power.columns.id') },
    { key: 'rangeMin', label: t('monitoring.power.columns.rangeMin') },
    { key: 'alarmMin', label: t('monitoring.power.columns.alarmMin') },
    { key: 'current', label: t('monitoring.power.columns.current') },
    { key: 'alarmMax', label: t('monitoring.power.columns.alarmMax') },
    { key: 'rangeMax', label: t('monitoring.power.columns.rangeMax') },
  ];

  return (
    <Table aria-label="Power monitoring table" className="w-full">
      <TableHeader columns={columns}>
        {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
      </TableHeader>
      <TableBody items={data}>
        {(item) => {
          const minKey = `power${item.id}_min`;
          const maxKey = `power${item.id}_max`;

          return (
            <TableRow key={`power-${item.id}`}>
              <TableCell>P_{item.id}</TableCell>
              <TableCell>{item.rangeMin.toFixed(6)}</TableCell>
              <TableCell>
                <Input
                  type="number"
                  size="sm"
                  value={inputValues[minKey] || ''}
                  onChange={(e) => onInputChange(minKey, e.target.value)}
                  variant="bordered"
                  classNames={{
                    input: 'text-sm',
                    inputWrapper: 'h-8',
                  }}
                />
              </TableCell>
              <TableCell>
                <span className="font-semibold">{item.currentValue.toFixed(6)}</span>
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  size="sm"
                  value={inputValues[maxKey] || ''}
                  onChange={(e) => onInputChange(maxKey, e.target.value)}
                  variant="bordered"
                  classNames={{
                    input: 'text-sm',
                    inputWrapper: 'h-8',
                  }}
                />
              </TableCell>
              <TableCell>{item.rangeMax.toFixed(6)}</TableCell>
            </TableRow>
          );
        }}
      </TableBody>
    </Table>
  );
};
