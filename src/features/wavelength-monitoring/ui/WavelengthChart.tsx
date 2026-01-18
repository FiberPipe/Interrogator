// src/features/wavelength-monitoring/ui/WavelengthChart.tsx
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardBody, Chip, Code } from '@heroui/react';
import { ChartSeries, LineChartWithConfidence } from '../../../shared/ui';

interface WavelengthChartProps {
  data: any[];
  selectedChannels: number[];
  colors: string[];
}

export const WavelengthChart = ({ data, selectedChannels, colors }: WavelengthChartProps) => {
  const { t } = useTranslation();

  const series = useMemo((): ChartSeries[] => {
    if (data.length === 0) return [];

    return selectedChannels.map((sensorIndex) => ({
      key: `WL${sensorIndex}`,
      label: t('monitoring.wavelength.sensor', { index: sensorIndex }),
      color: colors[sensorIndex],
      showConfidence: false,
      data: data.map((point) => {
        const wavelength = parseFloat(point[`wavelength${sensorIndex}`]);
        return {
          x: point.timestamp,
          y: isFinite(wavelength) ? wavelength : NaN,
          timestamp: point.timestamp,
        };
      }).filter(p => isFinite(p.y)), // Фильтруем NaN значения
    }));
  }, [data, selectedChannels, colors, t]);

  // Статистика по wavelength
  const stats = useMemo(() => {
    if (data.length === 0) return null;

    const latest = data[data.length - 1];
    const values = selectedChannels.map(idx => parseFloat(latest[`wavelength${idx}`])).filter(isFinite);

    if (values.length === 0) return null;

    return {
      average: values.reduce((sum, v) => sum + v, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }, [data, selectedChannels]);

  return (
    <div className="space-y-4">
      {/* Информационная панель */}
      {stats && (
        <Card className="bg-default-50 dark:bg-default-100/5">
          <CardBody>
            <div className="flex flex-wrap gap-4">
              <div>
                <span className="text-xs text-default-500">{t('monitoring.wavelength.average')}</span>
                <div className="text-lg font-semibold">{stats.average.toFixed(4)} nm</div>
              </div>
              <div>
                <span className="text-xs text-default-500">{t('monitoring.wavelength.range')}</span>
                <div className="text-sm">
                  {stats.min.toFixed(4)} - {stats.max.toFixed(4)} nm
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* График */}
      <LineChartWithConfidence
        series={series}
        height={500}
        xAxisLabel={t('charts.info.time')}
        yAxisLabel="Wavelength (nm)"
        xAxisDataKey="x"
        enableZoom
        defaultVisiblePoints={50}
        showLegend={false}
      />

      {/* Формула */}
      <Card className="bg-default-50 dark:bg-default-100/5">
        <CardBody className="py-3">
          <div className="text-sm space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{t('monitoring.formula')}:</span>
              <Code size="sm">λ = Σ(Pᵢ · λc,ᵢ) / Σ(Pᵢ)</Code>
            </div>
            <p className="text-xs text-default-500">
              {t('monitoring.wavelength.formulaDescription')}
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
