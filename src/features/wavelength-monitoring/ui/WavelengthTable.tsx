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

import type { GroupedWavelengthItem } from '../../../entities/sensor-data/model/types';

interface WavelengthTableProps {
  data: GroupedWavelengthItem[];
  inputValues: Record<string, string>;
  onInputChange: (key: string, value: string) => void;
}

export const WavelengthTable = ({ data, inputValues, onInputChange }: WavelengthTableProps) => {
  const { t } = useTranslation();

  const columns = [
    { key: 'id', label: t('monitoring.wavelength.columns.id') },
    { key: 'rangeMin', label: t('monitoring.wavelength.columns.rangeMin') },
    { key: 'alarmMin', label: t('monitoring.wavelength.columns.alarmMin') },
    { key: 'current', label: t('monitoring.wavelength.columns.current') },
    { key: 'alarmMax', label: t('monitoring.wavelength.columns.alarmMax') },
    { key: 'rangeMax', label: t('monitoring.wavelength.columns.rangeMax') },
  ];

  return (
    <Table aria-label="Wavelength monitoring table" className="w-full">
      <TableHeader columns={columns}>
        {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
      </TableHeader>
      <TableBody items={data}>
        {(item) => {
          const minKey = `wavelength${item.id}_min`;
          const maxKey = `wavelength${item.id}_max`;

          return (
            <TableRow key={`wl-${item.id}`}>
              <TableCell>WL_{item.id}</TableCell>
              <TableCell>{item.rangeMin.toFixed(6)}</TableCell>
              <TableCell>
                <Input
                  type="number"
                  size="sm"
                  value={inputValues[minKey] || ''}
                  onChange={(e) => onInputChange(minKey, e.target.value)}
                  variant="bordered"
                  classNames={{ input: 'text-sm', inputWrapper: 'h-8' }}
                />
              </TableCell>
              <TableCell>
                <span className="font-semibold">{item.wavelength.toFixed(6)}</span>
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  size="sm"
                  value={inputValues[maxKey] || ''}
                  onChange={(e) => onInputChange(maxKey, e.target.value)}
                  variant="bordered"
                  classNames={{ input: 'text-sm', inputWrapper: 'h-8' }}
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
