import { TableRow, TableCell, Chip } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import type { GroupedPowerItem } from '../../../entities/power-data/model/types';
import { PowerSparkline } from '../../../entities/power-data/ui/PowerSparkline';
import { AlarmInput } from '../../../entities/power-data/ui/AlarmInput';
import { isAlarmTriggered, formatValue } from '../../../entities/power-data/model/utils';

interface PowerTableRowProps {
  data: GroupedPowerItem;
  alarmMin?: number;
  alarmMax?: number;
  onAlarmChange: (type: 'min' | 'max', value: string) => void;
}

export const PowerTableRow = ({
  data,
  alarmMin,
  alarmMax,
  onAlarmChange,
}: PowerTableRowProps) => {
  const { t } = useTranslation();
  const alarm = isAlarmTriggered(data.currentValue, alarmMin, alarmMax);

  return (
    <TableRow key={data.id}>
      {/* ID */}
      <TableCell>
        <div className="flex items-center gap-2">
          <Chip size="sm" variant="flat" color="primary">
            P{data.id}
          </Chip>
          {alarm && (
            <Chip size="sm" variant="dot" color="danger">
              {alarm === 'min' ? '↓' : '↑'}
            </Chip>
          )}
        </div>
      </TableCell>

      {/* Range Min */}
      <TableCell>
        <span className="text-xs text-default-500 font-mono">
          {formatValue(data.rangeMin)}
        </span>
      </TableCell>

      {/* Alarm Min Input */}
      <TableCell>
        <AlarmInput
          value={alarmMin?.toString() || ''}
          onChange={(value) => onAlarmChange('min', value)}
          type="min"
          isAlarm={alarm === 'min'}
        />
      </TableCell>

      {/* Current Value */}
      <TableCell>
        <motion.div
          animate={{
            scale: alarm ? [1, 1.1, 1] : 1,
          }}
          transition={{ duration: 0.3 }}
        >
          <span
            className={`text-sm font-semibold font-mono ${
              alarm ? 'text-danger' : 'text-default-900'
            }`}
          >
            {formatValue(data.currentValue)}
          </span>
        </motion.div>
      </TableCell>

      {/* Sparkline */}
      <TableCell>
        <PowerSparkline
          values={data.values}
          width={100}
          height={30}
          color={alarm ? '#ef4444' : '#3b82f6'}
          alarmMin={alarmMin}
          alarmMax={alarmMax}
        />
      </TableCell>

      {/* Alarm Max Input */}
      <TableCell>
        <AlarmInput
          value={alarmMax?.toString() || ''}
          onChange={(value) => onAlarmChange('max', value)}
          type="max"
          isAlarm={alarm === 'max'}
        />
      </TableCell>

      {/* Range Max */}
      <TableCell>
        <span className="text-xs text-default-500 font-mono">
          {formatValue(data.rangeMax)}
        </span>
      </TableCell>
    </TableRow>
  );
};
