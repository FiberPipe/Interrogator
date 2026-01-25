// src/features/temperature-monitoring/ui/TemperatureChart.tsx
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardBody, Code, Switch, Chip } from '@heroui/react';

import type { TemperatureCoefficients } from '../../../entities/sensor-data/model/types';
import { useTemperatureCalculations } from '../model/useTemperatureMonitoring';
import type { ChartSeries } from '../../../shared/ui';
import { LineChartWithConfidence } from '../../../shared/ui';

interface TemperatureChartProps {
  data: any[];
  selectedChannels: number[];
  colors: string[];
  inputValues: Record<string, string>;
}

export const TemperatureChart = ({
  data,
  selectedChannels,
  colors,
  inputValues,
}: TemperatureChartProps) => {
  const { t } = useTranslation();
  const [showWavelength, setShowWavelength] = useState(false);

  // Строим карту коэффициентов
  const coefficientsMap = useMemo((): Record<number, TemperatureCoefficients> => {
    const map: Record<number, TemperatureCoefficients> = {};

    selectedChannels.forEach((sensorIndex) => {
      map[sensorIndex] = {
        lambda0: parseFloat(inputValues[`Temp_λ₀_${sensorIndex}`] || '0'),
        E: parseFloat(inputValues[`Temp_E_${sensorIndex}`] || '0'),
        D: parseFloat(inputValues[`Temp_D_${sensorIndex}`] || '0'),
        C: parseFloat(inputValues[`Temp_C_${sensorIndex}`] || '0'),
        B: parseFloat(inputValues[`Temp_B_${sensorIndex}`] || '0'),
        A: parseFloat(inputValues[`Temp_A_${sensorIndex}`] || '0'),
      };
    });

    return map;
  }, [selectedChannels, inputValues]);

  // Пересчитываем температуру
  const calculatedData = useTemperatureCalculations(data, coefficientsMap);

  // Серии для графика
  const series = useMemo((): ChartSeries[] => {
    if (calculatedData.length === 0) return [];

    if (showWavelength) {
      // Показываем wavelength
      return selectedChannels.map((sensorIndex) => ({
        key: `WL${sensorIndex}`,
        label: t('monitoring.temperature.wavelength', { index: sensorIndex }),
        color: colors[sensorIndex],
        data: calculatedData.map((point) => ({
          x: point.timestamp,
          y: parseFloat(point[`wavelength${sensorIndex}`]) || NaN,
          timestamp: point.timestamp,
        })),
      }));
    } else {
      // Показываем температуру
      return selectedChannels.map((sensorIndex) => ({
        key: `T${sensorIndex}`,
        label: t('monitoring.temperature.sensor', { index: sensorIndex }),
        color: colors[sensorIndex],
        data: calculatedData.map((point) => ({
          x: point.timestamp,
          y: point.temperatures?.[`T${sensorIndex}`] || NaN,
          timestamp: point.timestamp,
        })),
      }));
    }
  }, [calculatedData, selectedChannels, colors, showWavelength, t]);

  // Статистика
  const stats = useMemo(() => {
    if (calculatedData.length === 0) return null;

    const latest = calculatedData[calculatedData.length - 1];
    const temps = selectedChannels
      .map((idx) => latest.temperatures?.[`T${idx}`])
      .filter((v) => isFinite(v));

    if (temps.length === 0) return null;

    return {
      average: temps.reduce((sum, v) => sum + v, 0) / temps.length,
      min: Math.min(...temps),
      max: Math.max(...temps),
    };
  }, [calculatedData, selectedChannels]);

  return (
    <div className="space-y-4">
      {/* Переключатель режима */}
      <Card className="bg-default-50 dark:bg-default-100/5">
        <CardBody>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">
                  {showWavelength
                    ? t('monitoring.temperature.showingWavelength')
                    : t('monitoring.temperature.showingTemperature')}
                </span>
                {stats && !showWavelength && (
                  <Chip size="sm" color="primary" variant="flat">
                    {stats.average.toFixed(2)}°C
                  </Chip>
                )}
              </div>
              <p className="text-xs text-default-500">
                {t('monitoring.temperature.switchDescription')}
              </p>
            </div>
            <Switch isSelected={showWavelength} onValueChange={setShowWavelength} size="sm">
              {t('monitoring.temperature.wavelengthMode')}
            </Switch>
          </div>
        </CardBody>
      </Card>

      {/* График */}
      <LineChartWithConfidence
        series={series}
        height={500}
        xAxisLabel={t('charts.info.time')}
        yAxisLabel={showWavelength ? 'Wavelength (nm)' : 'Temperature (°C)'}
        xAxisDataKey="x"
        enableZoom
        defaultVisiblePoints={50}
        showLegend={false}
      />

      {/* Формула */}
      <Card className="bg-default-50 dark:bg-default-100/5">
        <CardBody className="py-3">
          <div className="text-sm space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{t('monitoring.formula')}:</span>
              <Code size="sm">T = E(λ - λ₀)⁴ + D(λ - λ₀)³ + C(λ - λ₀)² + B(λ - λ₀) + A</Code>
            </div>
            <div className="text-xs text-default-500 space-y-1">
              <p>где λ - измеренная длина волны, λ₀ - эталонная длина волны</p>
              <p>E, D, C, B, A - калибровочные коэффициенты</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
