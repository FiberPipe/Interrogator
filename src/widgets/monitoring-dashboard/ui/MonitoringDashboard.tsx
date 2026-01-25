import { useState, useMemo, useCallback } from 'react';
import { Card, CardBody, CardHeader, Chip, Alert, Divider } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertCircle } from 'lucide-react';

import type { SensorType, ViewMode } from '../../../entities/sensor-data/model/types';
import type { RowData } from '../../../shared/types/microcontroller-data';
import { useSerialPortContext } from '../../../app/providers/SerialPortProvider';
import { useSerialData } from '../hooks/useSerialData';
import { ChartLegend } from '../../../entities/chart/ui/ChartLegend';
import {
  PowerChart,
  WavelengthChart,
  TemperatureChart,
  DisplacementChart,
  PowerTable,
  WavelengthTable,
  TemperatureTable,
  DisplacementTable,
  ViewModeSelector,
  ChartControls,
} from '../../../features';

interface MonitoringDashboardProps {
  type: SensorType;
}

const COLORS = [
  '#4f46e5',
  '#e11d48',
  '#059669',
  '#f97316',
  '#8b5cf6',
  '#06b6d4',
  '#ec4899',
  '#14b8a6',
  '#f59e0b',
  '#6366f1',
  '#10b981',
  '#ef4444',
  '#3b82f6',
  '#f43f5e',
  '#a855f7',
  '#84cc16',
];

const CHANNELS = Array.from({ length: 16 }, (_, i) => i);

export const MonitoringDashboard = ({ type }: MonitoringDashboardProps) => {
  const { t } = useTranslation();
  const { connectedPort } = useSerialPortContext();
  const { dataBuffer, isReceiving, clearBuffer, latestData } = useSerialData(connectedPort);

  const [viewMode, setViewMode] = useState<ViewMode>('chart');
  const [selectedChannels, setSelectedChannels] = useState<number[]>(CHANNELS.slice(0, 4));

  const handleToggleChannel = useCallback((channel: number) => {
    setSelectedChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((c) => c !== channel)
        : [...prev, channel].sort((a, b) => a - b),
    );
  }, []);

  const handleSelectAll = useCallback(() => setSelectedChannels(CHANNELS), []);
  const handleDeselectAll = useCallback(() => setSelectedChannels([]), []);

  const averageValue = useMemo(() => {
    if (!latestData || selectedChannels.length === 0) return 0;

    if (type === 'power') {
      const sum = selectedChannels.reduce((acc, idx) => {
        const key = `P${idx}` as keyof RowData;
        const value = latestData[key];
        return acc + (typeof value === 'number' ? value : 0);
      }, 0);
      return sum / selectedChannels.length;
    }

    if (type === 'wavelength') {
      const sum = selectedChannels.reduce((acc, idx) => {
        const key = `wavelength${idx}` as keyof typeof latestData.wavelengths;
        const value = latestData.wavelengths[key];
        return acc + (typeof value === 'number' ? value : 0);
      }, 0);
      return sum / selectedChannels.length;
    }

    return 0;
  }, [latestData, selectedChannels, type]);

  const renderChart = () => {
    const commonProps = {
      data: dataBuffer,
      selectedChannels,
      colors: COLORS,
    };

    switch (type) {
      case 'power':
        return <PowerChart {...commonProps} />;
      case 'wavelength':
        return <WavelengthChart {...commonProps} />;
      case 'temperature':
        return <TemperatureChart {...commonProps} />;
      case 'displacement':
        return <DisplacementChart {...commonProps} />;
      default:
        return null;
    }
  };

  const renderTable = () => {
    switch (type) {
      case 'power':
        return <PowerTable data={dataBuffer} />;
      case 'wavelength':
        return <WavelengthTable data={dataBuffer} />;
      case 'temperature':
        return <TemperatureTable data={dataBuffer} />;
      case 'displacement':
        return <DisplacementTable data={dataBuffer} />;
      default:
        return null;
    }
  };

  const showLegend = viewMode === 'chart' && (type === 'power' || type === 'wavelength');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full h-full"
    >
      <Card className="shadow-lg w-full h-full">
        <CardHeader className="flex flex-col gap-4 pb-4">
          <div className="flex justify-between items-start w-full">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-bold">{t(`monitoring.${type}.title`)}</h3>

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

              <p className="text-sm text-default-500">{t(`monitoring.${type}.subtitle`)}</p>
            </div>

            <div className="flex items-center gap-3">
              <ViewModeSelector activeMode={viewMode} onModeChange={setViewMode} />
              <ChartControls onClear={clearBuffer} />
            </div>
          </div>
        </CardHeader>

        <Divider />

        <CardBody className="gap-6 overflow-auto">
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

          {/* Легенда каналов (только для графика power/wavelength) */}
          {showLegend && (
            <ChartLegend
              channels={CHANNELS}
              selectedChannels={selectedChannels}
              colors={COLORS}
              onToggle={handleToggleChannel}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
            />
          )}

          {/* Контент: График или Таблица */}
          <AnimatePresence mode="wait">
            {viewMode === 'chart' ? (
              <motion.div
                key="chart-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                {connectedPort && dataBuffer.length > 0 ? (
                  renderChart()
                ) : (
                  <EmptyState
                    isConnected={!!connectedPort}
                    message={
                      !connectedPort
                        ? t('charts.messages.portNotConnected')
                        : t('charts.messages.waitingData')
                    }
                  />
                )}
              </motion.div>
            ) : (
              <motion.div
                key="table-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                {renderTable()}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Футер с информацией */}
          {dataBuffer.length > 0 && (
            <div className="flex flex-wrap gap-4 text-xs text-default-400 pt-4 border-t">
              <div>
                {t('charts.info.records')}: <strong>{dataBuffer.length}/200</strong>
              </div>
              <div>
                {t('charts.info.selected')}: <strong>{selectedChannels.length}</strong>
              </div>
              {dataBuffer.length === 200 && (
                <div className="text-warning flex items-center gap-1">
                  <span>⚠️</span>
                  <span>{t('charts.status.bufferFull')}</span>
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>
    </motion.div>
  );
};

// ==================== Компонент пустого состояния ====================
interface EmptyStateProps {
  isConnected: boolean;
  message: string;
}

const EmptyState = ({ message }: EmptyStateProps) => {
  return (
    <div className="h-96 flex flex-col items-center justify-center text-default-400 gap-3 border-2 border-dashed border-default-200 rounded-lg">
      <Activity className="w-12 h-12 opacity-50" />
      <div className="text-lg font-medium">{message}</div>
    </div>
  );
};
