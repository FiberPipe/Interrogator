import {
    Card,
    CardBody,
    CardHeader,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    Spinner,
    Chip,
    Divider,
} from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Table as TableIcon, AlertTriangle } from 'lucide-react';

import { useSerialConnection } from '../../../features/serial-connection/model/useSerialConnection';
import { usePowerTable } from '../../../features/power-monitoring/model/usePowerTable';
import { PowerTableRow } from '../../../features/power-monitoring/ui/PowerTableRow';
import { groupDataByPowerId } from '../../../entities/power-data/model/utils';
import { useSerialData } from '../../PowerChartWidget/model/useSerialData';

export const PowerTableWidget = () => {
    const { t } = useTranslation();
    const { connectedPort } = useSerialConnection();
    const { dataBuffer, isReceiving } = useSerialData(connectedPort);
    const { alarmThresholds, isLoading, updateAlarmThreshold, getAlarmThreshold } = usePowerTable();

    const groupedData = groupDataByPowerId(dataBuffer);

    const columns = [
        { key: 'id', label: t('table.power.headers.id') },
        { key: 'rangeMin', label: t('table.power.headers.rangeMin') },
        { key: 'alarmMin', label: t('table.power.headers.alarmMin') },
        { key: 'current', label: t('table.power.headers.current') },
        { key: 'sparkline', label: t('table.power.headers.sparkline') },
        { key: 'alarmMax', label: t('table.power.headers.alarmMax') },
        { key: 'rangeMax', label: t('table.power.headers.rangeMax') },
    ];

    const alarmsCount = groupedData.filter((item) => {
        const alarmMin = getAlarmThreshold(item.id, 'min');
        const alarmMax = getAlarmThreshold(item.id, 'max');
        return (
            (alarmMin !== undefined && item.currentValue < alarmMin) ||
            (alarmMax !== undefined && item.currentValue > alarmMax)
        );
    }).length;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card>
                <CardHeader className="flex justify-between items-start pb-4">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                                <TableIcon className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">{t('table.power.title')}</h3>
                                <p className="text-sm text-default-500">{t('table.power.subtitle')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {alarmsCount > 0 && (
                            <Chip
                                color="danger"
                                variant="flat"
                                startContent={<AlertTriangle className="w-4 h-4" />}
                            >
                                {alarmsCount} {alarmsCount === 1 ? 'Alarm' : 'Alarms'}
                            </Chip>
                        )}
                        {isReceiving && (
                            <Chip color="success" variant="dot" size="sm">
                                {t('charts.status.live')}
                            </Chip>
                        )}
                        <Chip variant="flat" size="sm">
                            {t('table.power.records', { count: dataBuffer.length })}
                        </Chip>
                    </div>
                </CardHeader>

                <Divider />

                <CardBody>
                    {groupedData.length > 0 ? (
                        <Table
                            aria-label={t('table.power.title')}
                            classNames={{
                                wrapper: 'shadow-none',
                                th: 'bg-default-100',
                            }}
                        >
                            <TableHeader columns={columns}>
                                {(column) => (
                                    <TableColumn key={column.key} align={column.key === 'sparkline' ? 'center' : 'start'}>
                                        {column.label}
                                    </TableColumn>
                                )}
                            </TableHeader>
                            <TableBody>
                                {groupedData.map((item) => (
                                    <PowerTableRow
                                        key={item.id}
                                        data={item}
                                        alarmMin={getAlarmThreshold(item.id, 'min')}
                                        alarmMax={getAlarmThreshold(item.id, 'max')}
                                        onAlarmChange={(type, value) => updateAlarmThreshold(item.id, type, value)}
                                    />
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-default-400">
                            <TableIcon className="w-16 h-16 opacity-20 mb-4" />
                            <p className="text-lg font-medium">{t('table.power.noData')}</p>
                        </div>
                    )}
                </CardBody>
            </Card>
        </motion.div>
    );
};
