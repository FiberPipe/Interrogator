import { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardBody, Switch } from '@heroui/react';

import type { RowData } from '../../../shared/types/microcontroller-data';
import type { ChartSeries } from '../../../shared/ui';
import { LineChartWithConfidence } from '../../../shared/ui';

interface PowerChartProps {
  data: RowData[];
  selectedChannels: number[];
  colors: string[];
}

export const PowerChart = ({ data, selectedChannels, colors }: PowerChartProps) => {
  const { t } = useTranslation();
  const [showAlarms, setShowAlarms] = useState(true);
  const [alarmsMap, setAlarmsMap] = useState<
    Record<number, { min: number | null; max: number | null }>
  >({});

  // Загружаем алармы для выбранных каналов
  useEffect(() => {
    const loadAlarms = async () => {
      const loaded: Record<number, { min: number | null; max: number | null }> = {};

      await Promise.all(
        selectedChannels.map(async (channelId) => {
          const minKey = `power${channelId}_min`;
          const maxKey = `power${channelId}_max`;

          const [minVal, maxVal] = await Promise.all([
            window.appData.get(minKey),
            window.appData.get(maxKey),
          ]);

          loaded[channelId] = {
            min: minVal !== undefined && minVal !== null ? Number(minVal) : null,
            max: maxVal !== undefined && maxVal !== null ? Number(maxVal) : null,
          };
        }),
      );

      setAlarmsMap(loaded);
    };

    if (selectedChannels.length > 0) {
      loadAlarms();
    }
  }, [selectedChannels]);

  // Серии данных
  const series = useMemo((): ChartSeries[] => {
    if (data.length === 0) return [];

    return selectedChannels.map((channelIndex) => {
      const powerKey = `P${channelIndex}` as keyof RowData;
      const stdDevKey = `stdDev${channelIndex}` as keyof RowData;

      return {
        key: `P${channelIndex}`,
        label: t('charts.power.channel', { index: channelIndex }),
        color: colors[channelIndex % colors.length],
        showConfidence: true,
        data: data.map((point, index) => {
          const power = point[powerKey] as number | undefined;
          const stdDev = point[stdDevKey] as number | undefined;

          return {
            x: index,
            y: power ?? 0,
            yMin: (power ?? 0) - (stdDev ?? 0),
            yMax: (power ?? 0) + (stdDev ?? 0),
            timestamp: index,
          };
        }),
      };
    });
  }, [data, selectedChannels, colors, t]);

  // Референсные линии для алармов
  const referenceLines = useMemo((): any[] => {
    if (!showAlarms) return [];

    const lines: any[] = [];

    selectedChannels.forEach((channelId) => {
      const alarms = alarmsMap[channelId];
      if (!alarms) return;

      const color = colors[channelId % colors.length];

      if (alarms.min !== null && isFinite(alarms.min)) {
        lines.push({
          y: alarms.min,
          label: `P${channelId} Min`,
          stroke: color,
          strokeDasharray: '5 5',
          strokeWidth: 2,
          opacity: 0.6,
        });
      }

      if (alarms.max !== null && isFinite(alarms.max)) {
        lines.push({
          y: alarms.max,
          label: `P${channelId} Max`,
          stroke: color,
          strokeDasharray: '5 5',
          strokeWidth: 2,
          opacity: 0.6,
        });
      }
    });

    return lines;
  }, [showAlarms, selectedChannels, alarmsMap, colors]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-default-400 border-2 border-dashed border-default-200 rounded-lg">
        <div className="text-center">
          <div className="text-lg font-medium">{t('monitoring.power.noData')}</div>
          <div className="text-sm mt-1">{t('monitoring.power.waitingForData')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Переключатель алармов */}
      <Card className="bg-default-50 dark:bg-default-100/5">
        <CardBody>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-semibold text-sm">{t('monitoring.power.showAlarms')}</span>
              <p className="text-xs text-default-500">{t('monitoring.power.alarmsDescription')}</p>
            </div>
            <Switch isSelected={showAlarms} onValueChange={setShowAlarms} size="sm">
              {t('monitoring.power.alarmsToggle')}
            </Switch>
          </div>
        </CardBody>
      </Card>

      {/* График */}
      <LineChartWithConfidence
        series={series}
        referenceLines={referenceLines}
        height={500}
        xAxisLabel={t('charts.info.time')}
        yAxisLabel="Power (W)"
        xAxisDataKey="x"
        enableZoom
        defaultVisiblePoints={50}
        showLegend={false}
      />
    </div>
  );
};
