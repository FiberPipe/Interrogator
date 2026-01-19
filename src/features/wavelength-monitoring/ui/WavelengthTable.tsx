import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Input, Chip } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { groupDataByWavelengthId } from '../../../entities/sensor-data/model/utils';

interface WavelengthTableProps {
  data: any[];
  inputValues: Record<string, string>;
  onInputChange: (key: string, value: string) => void;
}

export const WavelengthTable = ({ data, inputValues, onInputChange }: WavelengthTableProps) => {
  const { t } = useTranslation();

  const groupedData = useMemo(() => groupDataByWavelengthId(data), [data]);

  const columns = [
    { key: 'id', label: t('monitoring.wavelength.columns.id') },
    { key: 'rangeMin', label: t('monitoring.wavelength.columns.rangeMin') },
    { key: 'alarmMin', label: t('monitoring.wavelength.columns.alarmMin') },
    { key: 'current', label: t('monitoring.wavelength.columns.current') },
    { key: 'alarmMax', label: t('monitoring.wavelength.columns.alarmMax') },
    { key: 'rangeMax', label: t('monitoring.wavelength.columns.rangeMax') },
  ];

  return (
    <div className="w-full overflow-auto">
      <Table aria-label="Wavelength monitoring table" className="w-full">
        <TableHeader columns={columns}>
          {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
        </TableHeader>
        <TableBody items={groupedData}>
          {(item) => {
            const minKey = `wavelength${item.id}_min`;
            const maxKey = `wavelength${item.id}_max`;

            return (
              <TableRow key={`wl-${item.id}`}>
                <TableCell>
                  <Chip size="sm" variant="flat" color="primary">
                    WL{item.id}
                  </Chip>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-default-500 font-mono">
                    {item.rangeMin.toFixed(6)}
                  </span>
                </TableCell>
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
                    placeholder="Min"
                  />
                </TableCell>
                <TableCell>
                  <span className="font-semibold font-mono">
                    {item.wavelength.toFixed(6)} nm
                  </span>
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
                    placeholder="Max"
                  />
                </TableCell>
                <TableCell>
                  <span className="text-xs text-default-500 font-mono">
                    {item.rangeMax.toFixed(6)}
                  </span>
                </TableCell>
              </TableRow>
            );
          }}
        </TableBody>
      </Table>
    </div>
  );
};
