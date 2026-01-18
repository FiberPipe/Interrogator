import { Card, CardBody, CardHeader, Chip, Alert, Divider } from '@heroui/react';
import { useMemo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertCircle } from 'lucide-react';
import { useSerialPortContext } from '../../../app/providers/SerialPortProvider';
import { ChartStats } from '../../../entities/chart/ui/ChartStats';
import { ChartLegend } from '../../../entities/chart/ui/ChartLegend';
import { ViewType } from '../../../entities/chart/model/types';
import { SerialDataPoint, useSerialData } from '../model/useSerialData';
import { ChartControls } from '../../../features/data-visualization/ChartsControls';
import { ViewModeSelector } from '../../../features/data-visualization/ViewModeSelector';
import { ChartSeries, LineChartWithConfidence } from '../../../shared/ui';

const COLORS = [
  '#4f46e5', '#e11d48', '#059669', '#f97316', '#8b5cf6',
  '#06b6d4', '#ec4899', '#14b8a6', '#f59e0b', '#6366f1',
  '#10b981', '#ef4444', '#3b82f6', '#f43f5e', '#a855f7', '#84cc16'
];

const CHANNELS = Array.from({ length: 16 }, (_, i) => i);

export const PowerChartWidget = () => {
  const { t } = useTranslation();
  const { connectedPort } = useSerialPortContext();
  const { dataBuffer, isReceiving, clearBuffer, latestData } = useSerialData(connectedPort);

  const [selectedChannels, setSelectedChannels] = useState<number[]>(CHANNELS.slice(0, 4));
  const [viewType, setViewType] = useState<ViewType>('chart');

  // Преобразуем данные в формат для графика
  const series = useMemo((): ChartSeries[] => {
    if (dataBuffer.length === 0) return [];

    return selectedChannels.map((channelIndex) => {
      const pKey = `P${channelIndex}` as keyof SerialDataPoint;
      const stdDevKey = `stdDev${channelIndex}` as keyof SerialDataPoint;

      return {
        key: `P${channelIndex}`,
        label: t('charts.power.channel', { index: channelIndex }),
        color: COLORS[channelIndex],
        showConfidence: true,
        data: dataBuffer.map((point) => {
          const yValue = point[pKey] as number;
          const stdDevValue = point[stdDevKey] as number;

          return {
            x: point.timestamp, // Используем временную метку
            y: yValue,
            yMin: yValue - stdDevValue,
            yMax: yValue + stdDevValue,
            timestamp: point.timestamp,
          };
        }),
      };
    });
  }, [dataBuffer, selectedChannels, t]);

  const averagePower = useMemo(() => {
    if (!latestData || selectedChannels.length === 0) return 0;

    const sum = selectedChannels.reduce((acc, idx) => {
      const key = `P${idx}` as keyof SerialDataPoint;
      return acc + (latestData[key] as number || 0);
    }, 0);

    return sum / selectedChannels.length;
  }, [latestData, selectedChannels]);

  const handleToggleChannel = useCallback((channel: number) => {
    setSelectedChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((c) => c !== channel)
        : [...prev, channel].sort((a, b) => a - b)
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedChannels(CHANNELS);
  }, []);

  const handleDeselectAll = useCallback(() => {
    setSelectedChannels([]);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Card className="shadow-lg">
        <CardHeader className="flex flex-col gap-4 pb-4">
          <div className="flex justify-between items-start w-full">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-bold">{t('charts.power.title')}</h3>
                {isReceiving && (
                  <Chip
                    color="success"
                    size="sm"
                    variant="dot"
                    startContent={<Activity className="w-3 h-3 animate-pulse" />}
                  >
                    {t('charts.status.live')}
                  </Chip>
                )}
                {connectedPort && !isReceiving && (
                  <Chip color="warning" size="sm" variant="dot">
                    {t('charts.status.waiting')}
                  </Chip>
                )}
              </div>
              <p className="text-sm text-default-500">{t('charts.power.subtitle')}</p>
            </div>

            <div className="flex items-center gap-3">
              <ViewModeSelector activeView={viewType} onViewChange={setViewType} />
              <ChartControls onClear={clearBuffer} />
            </div>
          </div>

          <ChartStats
            isReceiving={isReceiving}
            bufferSize={dataBuffer.length}
            maxBuffer={200}
            recordId={latestData?.id}
            time={latestData?.time}
            average={averagePower}
            connectedPort={connectedPort}
          />
        </CardHeader>

        <Divider />

        <CardBody className="gap-6">
          {!connectedPort && (
            <Alert
              color="warning"
              variant="flat"
              title={t('charts.status.notConnected')}
              startContent={<AlertCircle className="w-5 h-5" />}
            >
              {t('charts.messages.selectPort')}
            </Alert>
          )}

          <ChartLegend
            channels={CHANNELS}
            selectedChannels={selectedChannels}
            colors={COLORS}
            onToggle={handleToggleChannel}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
          />

          <AnimatePresence mode="wait">
            {viewType === 'chart' && (
              <motion.div
                key="chart"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full"
              >
                {series.length > 0 && selectedChannels.length > 0 ? (
                  <LineChartWithConfidence
                    series={series}
                    height={500}
                    xAxisLabel={t('charts.info.time')}
                    yAxisLabel="Power (W)"
                    xAxisDataKey="x"
                    enableZoom={true}
                    defaultVisiblePoints={50}
                    showLegend={false}
                  />
                ) : (
                  <div className="h-96 flex flex-col items-center justify-center text-default-400 gap-3 border-2 border-dashed border-default-200 rounded-lg">
                    <Activity className="w-12 h-12 opacity-50" />
                    <div className="text-lg font-medium">
                      {!connectedPort
                        ? t('charts.messages.portNotConnected')
                        : selectedChannels.length === 0
                        ? t('charts.messages.selectChannels')
                        : t('charts.messages.waitingData')}
                    </div>
                    {connectedPort && selectedChannels.length > 0 && (
                      <div className="text-sm">{t('charts.messages.dataWillAppear')}</div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {viewType === 'table' && (
              <motion.div
                key="table"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-96 flex items-center justify-center text-default-400"
              >
                {t('charts.types.table')} - Coming soon...
              </motion.div>
            )}
          </AnimatePresence>

          {dataBuffer.length > 0 && (
            <div className="flex flex-wrap gap-4 text-xs text-default-400 pt-4 border-t">
              <div>
                {t('charts.info.records')}: <strong>{dataBuffer.length}/200</strong>
              </div>
              <div>
                {t('charts.info.frequency')}: <strong>~1 Hz</strong>
              </div>
              <div>
                {t('charts.info.selected')}: <strong>{selectedChannels.length}</strong>
              </div>
              {dataBuffer.length === 200 && (
                <div className="text-warning">
                  ⚠️ {t('charts.status.bufferFull')} - {t('charts.messages.oldDataRemoved')}
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>
    </motion.div>
  );
};
