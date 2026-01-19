import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Input, Chip } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { groupDataByPowerId } from '../../../entities/sensor-data/model/utils';

interface PowerTableProps {
    data: any[];
    inputValues: Record<string, string>;
    onInputChange: (key: string, value: string) => void;
}

export const PowerTable = ({ data, inputValues, onInputChange }: PowerTableProps) => {
    const { t } = useTranslation();

    // Группируем данные по каналам
    const groupedData = useMemo(() => groupDataByPowerId(data), [data]);

    const columns = [
        { key: 'id', label: t('monitoring.power.columns.id') },
        { key: 'rangeMin', label: t('monitoring.power.columns.rangeMin') },
        { key: 'alarmMin', label: t('monitoring.power.columns.alarmMin') },
        { key: 'current', label: t('monitoring.power.columns.current') },
        { key: 'alarmMax', label: t('monitoring.power.columns.alarmMax') },
        { key: 'rangeMax', label: t('monitoring.power.columns.rangeMax') },
    ];

    return (
        <div className="w-full overflow-auto">
            <Table aria-label="Power monitoring table" className="w-full">
                <TableHeader columns={columns}>
                    {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
                </TableHeader>
                <TableBody items={groupedData}>
                    {(item) => {
                        const minKey = `power${item.id}_min`;
                        const maxKey = `power${item.id}_max`;
                        const alarmMin = parseFloat(inputValues[minKey]);
                        const alarmMax = parseFloat(inputValues[maxKey]);

                        // Проверка на алармы
                        const isAlarmLow = !isNaN(alarmMin) && item.currentValue < alarmMin;
                        const isAlarmHigh = !isNaN(alarmMax) && item.currentValue > alarmMax;
                        const hasAlarm = isAlarmLow || isAlarmHigh;

                        return (
                            <TableRow key={`power-${item.id}`}>
                                {/* ID */}
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Chip size="sm" variant="flat" color="primary">
                                            P{item.id}
                                        </Chip>
                                        {hasAlarm && (
                                            <Chip size="sm" variant="dot" color="danger">
                                                {isAlarmLow ? '↓' : '↑'}
                                            </Chip>
                                        )}
                                    </div>
                                </TableCell>

                                {/* Range Min */}
                                <TableCell>
                                    <span className="text-xs text-default-500 font-mono">
                                        {item.rangeMin.toFixed(6)}
                                    </span>
                                </TableCell>

                                {/* Alarm Min */}
                                <TableCell>
                                    <Input
                                        type="number"
                                        size="sm"
                                        value={inputValues[minKey] || ''}
                                        onChange={(e) => onInputChange(minKey, e.target.value)}
                                        variant="bordered"
                                        classNames={{
                                            input: 'text-sm',
                                            inputWrapper: `h-8 ${isAlarmLow ? 'border-danger' : ''}`,
                                        }}
                                        placeholder="Min"
                                    />
                                </TableCell>

                                {/* Current Value */}
                                <TableCell>
                                    <motion.span
                                        className={`font-semibold font-mono ${hasAlarm ? 'text-danger' : 'text-default-900'
                                            }`}
                                        animate={hasAlarm ? { scale: [1, 1.1, 1] } : {}}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {item.currentValue.toFixed(6)}
                                    </motion.span>
                                </TableCell>

                                {/* Alarm Max */}
                                <TableCell>
                                    <Input
                                        type="number"
                                        size="sm"
                                        value={inputValues[maxKey] || ''}
                                        onChange={(e) => onInputChange(maxKey, e.target.value)}
                                        variant="bordered"
                                        classNames={{
                                            input: 'text-sm',
                                            inputWrapper: `h-8 ${isAlarmHigh ? 'border-danger' : ''}`,
                                        }}
                                        placeholder="Max"
                                    />
                                </TableCell>

                                {/* Range Max */}
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
