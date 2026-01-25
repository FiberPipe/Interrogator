// src/features/displacement-monitoring/ui/DisplacementChart.tsx
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardBody, Code, Switch, Chip, Divider } from '@heroui/react';

import type { DisplacementCoefficients } from '../../../entities/sensor-data/model/types';
import { useDisplacementCalculations } from '../model/useDisplacementCalculations';
import type { ChartSeries } from '../../../shared/ui';
import { LineChartWithConfidence } from '../../../shared/ui';

interface DisplacementChartProps {
  data: any[];
  selectedChannels: number[];
  colors: string[];
  inputValues: Record<string, string>;
}

export const DisplacementChart = ({
  data,
  selectedChannels,
  colors,
  inputValues,
}: DisplacementChartProps) => {
  const { t } = useTranslation();
  const [showWavelength, setShowWavelength] = useState(false);

  // Строим карту коэффициентов
  const coefficientsMap = useMemo((): Record<number, DisplacementCoefficients> => {
    const map: Record<number, DisplacementCoefficients> = {};

    selectedChannels.forEach((sensorIndex) => {
      map[sensorIndex] = {
        lambda0: parseFloat(inputValues[`Displacement_lambda0_${sensorIndex}`] || '0'),
        k: parseFloat(inputValues[`Displacement_k_${sensorIndex}`] || '0'),
        C: parseFloat(inputValues[`Displacement_C_${sensorIndex}`] || '0'),
        B: parseFloat(inputValues[`Displacement_B_${sensorIndex}`] || '0'),
        alpha: parseFloat(inputValues[`Displacement_alpha_${sensorIndex}`] || '0'),
        T: parseFloat(inputValues[`Displacement_T_${sensorIndex}`] || '0'),
        T0: parseFloat(inputValues[`Displacement_T0_${sensorIndex}`] || '0'),
      };
    });

    return map;
  }, [selectedChannels, inputValues]);

  // Пересчитываем смещение
  const calculatedData = useDisplacementCalculations(data, coefficientsMap);

  // Серии для графика
  const series = useMemo((): ChartSeries[] => {
    if (calculatedData.length === 0) return [];

    if (showWavelength) {
      return selectedChannels.map((sensorIndex) => ({
        key: `WL${sensorIndex}`,
        label: t('monitoring.displacement.wavelength', { index: sensorIndex }),
        color: colors[sensorIndex],
        data: calculatedData.map((point) => ({
          x: point.timestamp,
          y: parseFloat(point[`wavelength${sensorIndex}`]) || NaN,
          timestamp: point.timestamp,
        })),
      }));
    } else {
      return selectedChannels.map((sensorIndex) => ({
        key: `D${sensorIndex}`,
        label: t('monitoring.displacement.sensor', { index: sensorIndex }),
        color: colors[sensorIndex],
        data: calculatedData.map((point) => ({
          x: point.timestamp,
          y: point.displacements?.[`D${sensorIndex}`] || NaN,
          timestamp: point.timestamp,
        })),
      }));
    }
  }, [calculatedData, selectedChannels, colors, showWavelength, t]);

  // Статистика
  const stats = useMemo(() => {
    if (calculatedData.length === 0) return null;

    const latest = calculatedData[calculatedData.length - 1];
    const displacements = selectedChannels
      .map((idx) => latest.displacements?.[`D${idx}`])
      .filter((v) => isFinite(v));

    if (displacements.length === 0) return null;

    return {
      average: displacements.reduce((sum, v) => sum + v, 0) / displacements.length,
      min: Math.min(...displacements),
      max: Math.max(...displacements),
    };
  }, [calculatedData, selectedChannels]);

  return (
    <div className="space-y-4">
      {/* Переключатель и статистика */}
      <Card className="bg-default-50 dark:bg-default-100/5">
        <CardBody>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">
                    {showWavelength
                      ? t('monitoring.displacement.showingWavelength')
                      : t('monitoring.displacement.showingDisplacement')}
                  </span>
                  {stats && !showWavelength && (
                    <Chip size="sm" color="primary" variant="flat">
                      {stats.average.toFixed(2)} μm/m
                    </Chip>
                  )}
                </div>
                <p className="text-xs text-default-500">
                  {t('monitoring.displacement.switchDescription')}
                </p>
              </div>
              <Switch isSelected={showWavelength} onValueChange={setShowWavelength} size="sm">
                {t('monitoring.displacement.wavelengthMode')}
              </Switch>
            </div>

            {stats && !showWavelength && (
              <>
                <Divider />
                <div className="flex gap-4 text-xs">
                  <div>
                    <span className="text-default-500">{t('monitoring.displacement.min')}:</span>
                    <span className="ml-1 font-semibold">{stats.min.toFixed(2)} μm/m</span>
                  </div>
                  <div>
                    <span className="text-default-500">{t('monitoring.displacement.max')}:</span>
                    <span className="ml-1 font-semibold">{stats.max.toFixed(2)} μm/m</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardBody>
      </Card>

      {/* График */}
      <LineChartWithConfidence
        series={series}
        height={500}
        xAxisLabel={t('charts.info.time')}
        yAxisLabel={showWavelength ? 'Wavelength (nm)' : 'Displacement (μm/m)'}
        xAxisDataKey="x"
        enableZoom
        defaultVisiblePoints={50}
        showLegend={false}
      />

      {/* Формула */}
      <Card className="bg-default-50 dark:bg-default-100/5">
        <CardBody className="py-3">
          <div className="text-sm space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold">{t('monitoring.formula')}:</span>
              <Code size="sm" className="text-xs">
                ε = (10⁶ · (λ - λ₀)) / (k · λ₀) - C(T² - T₀²) - (B + α)(T - T₀)
              </Code>
            </div>
            <div className="text-xs text-default-500 space-y-1">
              <p>где:</p>
              <ul className="list-disc list-inside space-y-0.5 ml-2">
                <li>λ - измеренная длина волны, λ₀ - эталонная длина волны</li>
                <li>k - калибровочный коэффициент датчика</li>
                <li>C - коэффициент температурной компенсации (квадратичный)</li>
                <li>B - коэффициент температурной компенсации (линейный)</li>
                <li>α - коэффициент теплового расширения</li>
                <li>T - текущая температура, T₀ - эталонная температура</li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
