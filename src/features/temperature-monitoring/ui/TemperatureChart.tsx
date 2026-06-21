import { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardBody, Code, Switch, Chip, Spinner } from '@heroui/react';

import type { TemperatureCoefficients } from '../../../entities/temperature/model/types';
import { useTemperatureCalculations } from '../model/useTemperatureCalculations';
import type { ChartSeries } from '../../../shared/ui';
import { LineChartWithConfidence } from '../../../shared/ui';
import type { RowData } from '../../../shared/types/microcontroller-data';
import { appDataApi } from '../../../shared/api/app-data.api';

interface TemperatureChartProps {
  data: RowData[];
  selectedChannels: number[];
  colors: string[];
}

export const TemperatureChart = ({ data, selectedChannels, colors }: TemperatureChartProps) => {
  const { t } = useTranslation();
  const [showWavelength, setShowWavelength] = useState(false);
  const [coefficientsMap, setCoefficientsMap] = useState<Record<number, TemperatureCoefficients>>(
    {},
  );
  const [isLoadingCoefficients, setIsLoadingCoefficients] = useState(true);

  // Загружаем коэффициенты для выбранных каналов
  useEffect(() => {
    const loadCoefficients = async () => {
      setIsLoadingCoefficients(true);
      try {
        const map: Record<number, TemperatureCoefficients> = {};

        await Promise.all(
          selectedChannels.map(async (sensorIndex) => {
            const keys: Array<keyof TemperatureCoefficients> = ['lambda0', 'E', 'D', 'C', 'B', 'A'];

            const coeffs: Partial<TemperatureCoefficients> = {};

            await Promise.all(
              keys.map(async (key) => {
                const storageKey = `Temp_${key}_${sensorIndex}`;
                const value = await appDataApi.get(storageKey);
                coeffs[key] = value !== undefined && value !== null ? Number(value) : 0;
              }),
            );

            map[sensorIndex] = coeffs as TemperatureCoefficients;
          }),
        );

        setCoefficientsMap(map);
      } catch (error) {
        console.error('Failed to load temperature coefficients:', error);
      } finally {
        setIsLoadingCoefficients(false);
      }
    };

    if (selectedChannels.length > 0) {
      loadCoefficients();
    } else {
      setIsLoadingCoefficients(false);
      setCoefficientsMap({});
    }
  }, [selectedChannels]);

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
        color: colors[sensorIndex % colors.length],
        data: calculatedData.map((point) => {
          const wavelengthKey = `wavelength${sensorIndex}` as keyof typeof point.wavelengths;
          return {
            x: point.timestamp,
            y: Number(point.wavelengths[wavelengthKey]) || NaN,
            timestamp: point.timestamp,
          };
        }),
      }));
    } else {
      // Показываем температуру
      return selectedChannels.map((sensorIndex) => ({
        key: `T${sensorIndex}`,
        label: t('monitoring.temperature.sensor', { index: sensorIndex }),
        color: colors[sensorIndex % colors.length],
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
    if (calculatedData.length === 0 || showWavelength) return null;

    const latest = calculatedData[calculatedData.length - 1];
    const temps = selectedChannels
      .map((idx) => latest.temperatures?.[`T${idx}`])
      .filter((v): v is number => typeof v === 'number' && isFinite(v));

    if (temps.length === 0) return null;

    return {
      average: temps.reduce((sum, v) => sum + v, 0) / temps.length,
      min: Math.min(...temps),
      max: Math.max(...temps),
    };
  }, [calculatedData, selectedChannels, showWavelength]);

  // Проверка на наличие коэффициентов
  const hasCoefficients = useMemo(() => {
    return selectedChannels.some((idx) => {
      const coeffs = coefficientsMap[idx];
      return (
        coeffs && Object.values(coeffs).some((v) => typeof v === 'number' && v !== 0 && isFinite(v))
      );
    });
  }, [coefficientsMap, selectedChannels]);

  if (isLoadingCoefficients) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" label={t('common.loading')} />
      </div>
    );
  }

  if (selectedChannels.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-default-400 border-2 border-dashed border-default-200 rounded-lg">
        <div className="text-center">
          <div className="text-lg font-medium">
            {t('monitoring.temperature.noChannelsSelected')}
          </div>
          <div className="text-sm mt-1">{t('monitoring.temperature.selectChannelsHint')}</div>
        </div>
      </div>
    );
  }

  if (!hasCoefficients && !showWavelength) {
    return (
      <div className="space-y-4">
        <Card className="bg-warning-50 dark:bg-warning-100/10 border-warning">
          <CardBody className="text-center py-8">
            <div className="text-warning text-lg font-semibold mb-2">
              ⚠️ {t('monitoring.temperature.noCoefficients')}
            </div>
            <p className="text-sm text-default-600">
              {t('monitoring.temperature.configureCoefficientsHint')}
            </p>
          </CardBody>
        </Card>

        {/* Показываем wavelength по умолчанию */}
        <LineChartWithConfidence
          series={selectedChannels.map((sensorIndex) => ({
            key: `WL${sensorIndex}`,
            label: t('monitoring.temperature.wavelength', { index: sensorIndex }),
            color: colors[sensorIndex % colors.length],
            data: data.map((point) => {
              const wavelengthKey = `wavelength${sensorIndex}` as keyof typeof point.wavelengths;
              return {
                x: point.timestamp,
                y: Number(point.wavelengths[wavelengthKey]) || NaN,
                timestamp: point.timestamp,
              };
            }),
          }))}
          height={500}
          xAxisLabel={t('charts.info.time')}
          yAxisLabel="Wavelength (nm)"
          xAxisDataKey="x"
          enableZoom
          defaultVisiblePoints={50}
          showLegend={false}
        />
      </div>
    );
  }

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
              <p>{t('monitoring.temperature.formulaDescription')}</p>
              <p>{t('monitoring.temperature.coefficientsDescription')}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Статистика по температурам */}
      {stats && !showWavelength && (
        <Card className="bg-default-50 dark:bg-default-100/5">
          <CardBody>
            <div className="flex items-center justify-around text-sm">
              <div className="text-center">
                <div className="text-xs text-default-500 mb-1">
                  {t('monitoring.temperature.stats.average')}
                </div>
                <div className="text-lg font-semibold">{stats.average.toFixed(2)}°C</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-default-500 mb-1">
                  {t('monitoring.temperature.stats.min')}
                </div>
                <div className="text-lg font-semibold text-primary">{stats.min.toFixed(2)}°C</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-default-500 mb-1">
                  {t('monitoring.temperature.stats.max')}
                </div>
                <div className="text-lg font-semibold text-danger">{stats.max.toFixed(2)}°C</div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};
