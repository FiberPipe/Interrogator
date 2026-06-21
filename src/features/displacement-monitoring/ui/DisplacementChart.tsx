import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardBody, Switch, Chip, Spinner, Divider } from '@heroui/react';

import type { RowData } from '../../../shared/types/microcontroller-data';
import type { DisplacementCoefficients } from '../../../entities/displacement';
import { DisplacementFormulaDisplay } from '../../../entities/displacement';
import { useDisplacementCalculations } from '../model/useDisplacementCalculations';
import type { ChartSeries } from '../../../shared/ui';
import { LineChartWithConfidence } from '../../../shared/ui';
import { appDataApi } from '../../../shared/api/app-data.api';

interface DisplacementChartProps {
  data: RowData[];
  selectedChannels: number[];
  colors: string[];
}

export const DisplacementChart = ({ data, selectedChannels, colors }: DisplacementChartProps) => {
  const { t } = useTranslation();
  const [showWavelength, setShowWavelength] = useState(false);
  const [coefficientsMap, setCoefficientsMap] = useState<Record<number, DisplacementCoefficients>>(
    {},
  );
  const [isLoadingCoefficients, setIsLoadingCoefficients] = useState(true);

  // Загружаем коэффициенты для выбранных каналов
  useEffect(() => {
    const loadCoefficients = async () => {
      setIsLoadingCoefficients(true);
      try {
        const map: Record<number, DisplacementCoefficients> = {};

        await Promise.all(
          selectedChannels.map(async (sensorIndex) => {
            const keys: Array<keyof DisplacementCoefficients> = [
              'lambda0',
              'k',
              'C',
              'B',
              'alpha',
              'T',
              'T0',
            ];

            const coeffs: Partial<DisplacementCoefficients> = {};

            await Promise.all(
              keys.map(async (key) => {
                const storageKey = `Displacement_${key}_${sensorIndex}`;
                const value = await appDataApi.get(storageKey);

                if ((key === 'T' || key === 'T0') && (value === undefined || value === null)) {
                  coeffs[key] = 20;
                } else {
                  coeffs[key] = value !== undefined && value !== null ? Number(value) : 0;
                }
              }),
            );

            map[sensorIndex] = coeffs as DisplacementCoefficients;
          }),
        );

        setCoefficientsMap(map);
      } catch (error) {
        console.error('Failed to load displacement coefficients:', error);
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

  const calculatedData = useDisplacementCalculations(data, coefficientsMap);

  const series = useMemo((): ChartSeries[] => {
    if (calculatedData.length === 0) return [];

    if (showWavelength) {
      return selectedChannels.map((sensorIndex) => ({
        key: `WL${sensorIndex}`,
        label: t('monitoring.displacement.wavelength', { index: sensorIndex }),
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
      return selectedChannels.map((sensorIndex) => ({
        key: `D${sensorIndex}`,
        label: t('monitoring.displacement.sensor', { index: sensorIndex }),
        color: colors[sensorIndex % colors.length],
        data: calculatedData.map((point) => ({
          x: point.timestamp,
          y: point.displacements?.[`D${sensorIndex}`] || NaN,
          timestamp: point.timestamp,
        })),
      }));
    }
  }, [calculatedData, selectedChannels, colors, showWavelength, t]);

  const stats = useMemo(() => {
    if (calculatedData.length === 0 || showWavelength) return null;

    const latest = calculatedData[calculatedData.length - 1];
    const displacements = selectedChannels
      .map((idx) => latest.displacements?.[`D${idx}`])
      .filter((v): v is number => typeof v === 'number' && isFinite(v));

    if (displacements.length === 0) return null;

    return {
      average: displacements.reduce((sum, v) => sum + v, 0) / displacements.length,
      min: Math.min(...displacements),
      max: Math.max(...displacements),
    };
  }, [calculatedData, selectedChannels, showWavelength]);

  const hasCoefficients = useMemo(() => {
    return selectedChannels.some((idx) => {
      const coeffs = coefficientsMap[idx];
      return coeffs && coeffs.lambda0 !== 0 && coeffs.k !== 0;
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
            {t('monitoring.displacement.noChannelsSelected')}
          </div>
          <div className="text-sm mt-1">{t('monitoring.displacement.selectChannelsHint')}</div>
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
              ⚠️ {t('monitoring.displacement.noCoefficients')}
            </div>
            <p className="text-sm text-default-600">
              {t('monitoring.displacement.configureCoefficientsHint')}
            </p>
          </CardBody>
        </Card>

        <LineChartWithConfidence
          series={selectedChannels.map((sensorIndex) => ({
            key: `WL${sensorIndex}`,
            label: t('monitoring.displacement.wavelength', { index: sensorIndex }),
            color: colors[sensorIndex % colors.length],
            data: data.map((point, index) => {
              const wavelengthKey = `wavelength${sensorIndex}` as keyof typeof point.wavelengths;
              return {
                x: index,
                y: Number(point.wavelengths[wavelengthKey]) || NaN,
                timestamp: index,
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
                    <span className="text-default-500">
                      {t('monitoring.displacement.stats.min')}:
                    </span>
                    <span className="ml-1 font-semibold">{stats.min.toFixed(2)} μm/m</span>
                  </div>
                  <div>
                    <span className="text-default-500">
                      {t('monitoring.displacement.stats.max')}:
                    </span>
                    <span className="ml-1 font-semibold">{stats.max.toFixed(2)} μm/m</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardBody>
      </Card>

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

      <DisplacementFormulaDisplay />
    </div>
  );
};
