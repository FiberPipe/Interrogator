import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChartSeries, LineChartWithConfidence } from '../../../shared/ui';

interface PowerChartProps {
  data: any[];
  selectedChannels: number[];
  colors: string[];
}

export const PowerChart = ({ data, selectedChannels, colors }: PowerChartProps) => {
  const { t } = useTranslation();

  const series = useMemo((): ChartSeries[] => {
    if (data.length === 0) return [];

    return selectedChannels.map((channelIndex) => ({
      key: `P${channelIndex}`,
      label: t('charts.power.channel', { index: channelIndex }),
      color: colors[channelIndex],
      showConfidence: true,
      data: data.map((point) => ({
        x: point.timestamp,
        y: parseFloat(point[`P${channelIndex}`]) || 0,
        yMin: parseFloat(point[`P${channelIndex}`]) - parseFloat(point[`stdDev${channelIndex}`] || 0),
        yMax: parseFloat(point[`P${channelIndex}`]) + parseFloat(point[`stdDev${channelIndex}`] || 0),
        timestamp: point.timestamp,
      })),
    }));
  }, [data, selectedChannels, colors, t]);

  return (
    <LineChartWithConfidence
      series={series}
      height={500}
      xAxisLabel={t('charts.info.time')}
      yAxisLabel="Power (W)"
      xAxisDataKey="x"
      enableZoom
      defaultVisiblePoints={50}
      showLegend={false}
    />
  );
};
