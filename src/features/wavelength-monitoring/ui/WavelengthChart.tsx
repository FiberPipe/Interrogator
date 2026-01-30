import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardBody, Code } from '@heroui/react';

import type { RowData } from '../../../ui/shared/types/microcontroller-data';
import type { ChartSeries } from '../../../ui/shared/ui';
import { LineChartWithConfidence } from '../../../ui/shared/ui';

interface WavelengthChartProps {
  data: RowData[];
  selectedChannels: number[];
  colors: string[];
}

export const WavelengthChart = ({ data, selectedChannels, colors }: WavelengthChartProps) => {
  const { t } = useTranslation();

  const series = useMemo((): ChartSeries[] => {
    if (data.length === 0) return [];

    return selectedChannels.map((sensorIndex) => {
      const wavelengthKey = `wavelength${sensorIndex}` as const;

      return {
        key: `WL${sensorIndex}`,
        label: t('monitoring.wavelength.sensor', { index: sensorIndex }),
        color: colors[sensorIndex % colors.length],
        showConfidence: false,
        data: data
          .map((point, index) => {
            const value = point.wavelengths[wavelengthKey];
            const wavelength = typeof value === 'number' ? value : NaN;

            return {
              x: index,
              y: wavelength,
              timestamp: index,
            };
          })
          .filter((p) => isFinite(p.y)),
      };
    });
  }, [data, selectedChannels, colors, t]);

  // Статистика по wavelength
  const stats = useMemo(() => {
    if (data.length === 0 || selectedChannels.length === 0) return null;

    const latest = data[data.length - 1];
    if (!latest?.wavelengths) return null;

    const values = selectedChannels
      .map((idx) => {
        const key = `wavelength${idx}` as keyof typeof latest.wavelengths;
        const value = latest.wavelengths[key];
        return typeof value === 'number' ? value : NaN;
      })
      .filter(isFinite);

    if (values.length === 0) return null;

    return {
      average: values.reduce((sum, v) => sum + v, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }, [data, selectedChannels]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-default-400 border-2 border-dashed border-default-200 rounded-lg">
        <div className="text-center">
          <div className="text-lg font-medium">{t('monitoring.wavelength.noData')}</div>
          <div className="text-sm mt-1">{t('monitoring.wavelength.waitingForData')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Информационная панель */}
      {stats && (
        <Card className="bg-default-50 dark:bg-default-100/5">
          <CardBody>
            <div className="flex flex-wrap gap-4">
              <div>
                <span className="text-xs text-default-500">
                  {t('monitoring.wavelength.average')}
                </span>
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
