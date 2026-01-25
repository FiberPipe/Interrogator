import { useState, useEffect, useMemo, useCallback } from 'react';
import type { TooltipProps } from 'recharts';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  Legend,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import { Slider, Card, CardBody, Input, Button, Switch } from '@heroui/react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import React from 'react';

export interface ChartDataPoint {
  x: number | string;
  y: number;
  yMin?: number;
  yMax?: number;
  timestamp?: string;
  [key: string]: any;
}

export interface ChartSeries {
  key: string;
  label: string;
  color: string;
  data: ChartDataPoint[];
  showConfidence?: boolean;
  strokeWidth?: number;
  strokeDasharray?: string;
}

export interface ReferenceLine {
  y: number;
  label?: string;
  stroke?: string;
  strokeDasharray?: string;
  strokeWidth?: number;
  opacity?: number;
}

interface LineChartWithConfidenceProps {
  series: ChartSeries[];
  referenceLines?: ReferenceLine[];
  height?: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
  xAxisDataKey?: string;
  enableZoom?: boolean;
  defaultVisiblePoints?: number;
  showLegend?: boolean;
  customTooltip?: React.ComponentType<TooltipProps<any, any>>;
}

export const LineChartWithConfidence = ({
  series,
  referenceLines = [],
  height = 400,
  xAxisLabel,
  yAxisLabel,
  xAxisDataKey = 'x',
  enableZoom = true,
  defaultVisiblePoints = 50,
  showLegend = true,
  customTooltip,
}: LineChartWithConfidenceProps) => {
  const maxDataLength = series[0]?.data.length || 0;

  // Состояние для X-диапазона (временная ось)
  const [xRange, setXRange] = useState<[number, number]>([
    Math.max(0, maxDataLength - defaultVisiblePoints),
    maxDataLength - 1,
  ]);

  // Состояние для Y-диапазона (значения)
  const [yDomain, setYDomain] = useState<[number | 'auto', number | 'auto']>(['auto', 'auto']);
  const [customYMin, setCustomYMin] = useState<string>('');
  const [customYMax, setCustomYMax] = useState<string>('');
  const [useCustomYDomain, setUseCustomYDomain] = useState(false);

  // Состояние для алармовых зон
  const [showAlarmZones, setShowAlarmZones] = useState(true);

  // Автообновление X-диапазона при новых данных
  useEffect(() => {
    if (maxDataLength > 0) {
      const start = Math.max(0, maxDataLength - defaultVisiblePoints);
      const end = maxDataLength - 1;
      setXRange([start, end]);
    }
  }, [maxDataLength, defaultVisiblePoints]);

  // Подготовка данных для графика
  const chartData = useMemo(() => {
    if (series.length === 0 || maxDataLength === 0) return [];

    const start = xRange[0];
    const end = xRange[1];
    const length = end - start + 1;
    const result: any[] = [];

    for (let i = 0; i < length; i++) {
      const globalIndex = start + i;
      const dataPoint: any = {};

      series.forEach((s) => {
        if (s.data[globalIndex]) {
          const point = s.data[globalIndex];

          if (!dataPoint[xAxisDataKey]) {
            dataPoint[xAxisDataKey] = point[xAxisDataKey] || point.x;
          }

          if (!dataPoint.timestamp && point.timestamp) {
            dataPoint.timestamp = point.timestamp;
          }

          dataPoint[s.key] = point.y;

          if (s.showConfidence && point.yMin !== undefined && point.yMax !== undefined) {
            dataPoint[`${s.key}_min`] = point.yMin;
            dataPoint[`${s.key}_max`] = point.yMax;
          }
        }
      });

      result.push(dataPoint);
    }

    return result;
  }, [series, xRange, maxDataLength, xAxisDataKey]);

  // Вычисление автоматического Y-диапазона
  const autoYDomain = useMemo(() => {
    if (chartData.length === 0) return [0, 1];

    let min = Infinity;
    let max = -Infinity;

    chartData.forEach((point) => {
      series.forEach((s) => {
        const value = point[s.key];
        if (typeof value === 'number' && isFinite(value)) {
          min = Math.min(min, value);
          max = Math.max(max, value);
        }

        if (s.showConfidence) {
          const minVal = point[`${s.key}_min`];
          const maxVal = point[`${s.key}_max`];
          if (typeof minVal === 'number' && isFinite(minVal)) min = Math.min(min, minVal);
          if (typeof maxVal === 'number' && isFinite(maxVal)) max = Math.max(max, maxVal);
        }
      });
    });

    const padding = (max - min) * 0.1;
    return [min - padding, max + padding];
  }, [chartData, series]);

  // Применение Y-диапазона
  const finalYDomain = useMemo(() => {
    if (!useCustomYDomain) return autoYDomain;

    const min = parseFloat(customYMin);
    const max = parseFloat(customYMax);

    return [isFinite(min) ? min : autoYDomain[0], isFinite(max) ? max : autoYDomain[1]];
  }, [useCustomYDomain, customYMin, customYMax, autoYDomain]);

  // Группировка референсных линий по min/max парам
  const alarmZones = useMemo(() => {
    const zones: Array<{ min: number; max: number; color: string }> = [];
    const linesByChannel: Record<string, { min?: number; max?: number; color?: string }> = {};

    referenceLines.forEach((line) => {
      const match = line.label?.match(/^(.+?)\s+(Min|Max)$/);
      if (match) {
        const [, channelName, type] = match;
        if (!linesByChannel[channelName]) {
          linesByChannel[channelName] = {};
        }
        if (type === 'Min') {
          linesByChannel[channelName].min = line.y;
          linesByChannel[channelName].color = line.stroke;
        } else {
          linesByChannel[channelName].max = line.y;
          linesByChannel[channelName].color = line.stroke;
        }
      }
    });

    Object.values(linesByChannel).forEach((zone) => {
      if (zone.min !== undefined && zone.max !== undefined && zone.color) {
        zones.push({ min: zone.min, max: zone.max, color: zone.color });
      }
    });

    return zones;
  }, [referenceLines]);

  // Обработчики зума
  const handleZoomIn = useCallback(() => {
    const [min, max] = finalYDomain;
    const center = (min + max) / 2;
    const range = max - min;
    const newRange = range * 0.7;

    setCustomYMin(String((center - newRange / 2).toFixed(6)));
    setCustomYMax(String((center + newRange / 2).toFixed(6)));
    setUseCustomYDomain(true);
  }, [finalYDomain]);

  const handleZoomOut = useCallback(() => {
    const [min, max] = finalYDomain;
    const center = (min + max) / 2;
    const range = max - min;
    const newRange = range * 1.3;

    setCustomYMin(String((center - newRange / 2).toFixed(6)));
    setCustomYMax(String((center + newRange / 2).toFixed(6)));
    setUseCustomYDomain(true);
  }, [finalYDomain]);

  const handleResetZoom = useCallback(() => {
    setUseCustomYDomain(false);
    setCustomYMin('');
    setCustomYMax('');
  }, []);

  const formatXAxis = (value: any) => {
    if (typeof value === 'string' && value.includes(':')) return value;
    return value;
  };

  const TooltipComponent = customTooltip || DefaultTooltip;

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Панель управления зумом */}
      <Card className="bg-default-50 dark:bg-default-100/5">
        <CardBody>
          <div className="flex flex-col gap-4">
            {/* Переключатели */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <Switch size="sm" isSelected={useCustomYDomain} onValueChange={setUseCustomYDomain}>
                  Фиксировать масштаб Y
                </Switch>
                <Switch size="sm" isSelected={showAlarmZones} onValueChange={setShowAlarmZones}>
                  Показать зоны алармов
                </Switch>
              </div>

              {/* Кнопки зума */}
              <div className="flex items-center gap-2">
                <Button size="sm" variant="flat" isIconOnly onPress={handleZoomIn}>
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="flat" isIconOnly onPress={handleZoomOut}>
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="flat" isIconOnly onPress={handleResetZoom}>
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Инпуты для Y-диапазона */}
            {useCustomYDomain && (
              <div className="flex items-center gap-3">
                <Input
                  label="Y Min"
                  type="number"
                  size="sm"
                  value={customYMin}
                  onChange={(e) => setCustomYMin(e.target.value)}
                  placeholder={String(autoYDomain[0].toFixed(3))}
                  step="0.001"
                  classNames={{ input: 'font-mono' }}
                />
                <Input
                  label="Y Max"
                  type="number"
                  size="sm"
                  value={customYMax}
                  onChange={(e) => setCustomYMax(e.target.value)}
                  placeholder={String(autoYDomain[1].toFixed(3))}
                  step="0.001"
                  classNames={{ input: 'font-mono' }}
                />
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* График */}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />

            <XAxis
              dataKey={xAxisDataKey}
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
              tickFormatter={formatXAxis}
              angle={-45}
              textAnchor="end"
              height={60}
              label={
                xAxisLabel
                  ? {
                      value: xAxisLabel,
                      position: 'insideBottom',
                      offset: -20,
                      style: { fontSize: 14, fontWeight: 500 },
                    }
                  : undefined
              }
            />

            <YAxis
              domain={finalYDomain}
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
              width={80}
              tickFormatter={(val) => val.toFixed(3)}
              label={
                yAxisLabel
                  ? {
                      value: yAxisLabel,
                      angle: -90,
                      position: 'insideLeft',
                      style: { fontSize: 14, fontWeight: 500 },
                    }
                  : undefined
              }
            />

            <Tooltip content={<TooltipComponent />} />

            {showLegend && <Legend />}

            {/* Зоны алармов (закрашенные области) */}
            {showAlarmZones &&
              alarmZones.map((zone, index) => (
                <ReferenceArea
                  key={`alarm-zone-${index}`}
                  y1={zone.min}
                  y2={zone.max}
                  fill={zone.color}
                  fillOpacity={0.1}
                  stroke={zone.color}
                  strokeOpacity={0.3}
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
              ))}

            {/* Референсные линии */}
            {referenceLines.map((line, index) => (
              <ReferenceLine
                key={`ref-line-${index}`}
                y={line.y}
                label={line.label}
                stroke={line.stroke || '#888'}
                strokeDasharray={line.strokeDasharray || '5 5'}
                strokeWidth={line.strokeWidth || 2}
                opacity={line.opacity || 0.6}
              />
            ))}

            {/* Серии данных */}
            {series.map((s) => (
              <React.Fragment key={s.key}>
                {/* Confidence область */}
                {s.showConfidence && (
                  <>
                    <Area
                      type="monotone"
                      dataKey={`${s.key}_max`}
                      stroke="none"
                      fill={s.color}
                      fillOpacity={0.1}
                      activeDot={false}
                    />
                    <Area
                      type="monotone"
                      dataKey={`${s.key}_min`}
                      stroke="none"
                      fill="#fff"
                      fillOpacity={1}
                      activeDot={false}
                    />
                  </>
                )}

                {/* Основная линия */}
                <Line
                  type="monotone"
                  dataKey={s.key}
                  stroke={s.color}
                  strokeWidth={s.strokeWidth || 2}
                  strokeDasharray={s.strokeDasharray}
                  dot={false}
                  name={s.label}
                  animationDuration={300}
                  connectNulls
                />
              </React.Fragment>
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* X-диапазон (временной слайдер) */}
      {enableZoom && maxDataLength > defaultVisiblePoints && (
        <Slider
          size="sm"
          minValue={0}
          maxValue={Math.max(0, maxDataLength - 1)}
          value={xRange}
          onChange={(val) => setXRange(val as [number, number])}
          step={1}
          className="max-w-full"
          label="Диапазон отображения (время)"
          showTooltip
          tooltipValueFormatOptions={{
            formatter: (val: number) => `${val}`,
          }}
        />
      )}

      {/* Информация о текущем масштабе */}
      <div className="flex items-center justify-between text-xs text-default-500">
        <div>
          Y: [{finalYDomain[0].toFixed(3)}, {finalYDomain[1].toFixed(3)}]
        </div>
        <div>
          X: [{xRange[0]}, {xRange[1]}] ({xRange[1] - xRange[0] + 1} точек)
        </div>
      </div>
    </div>
  );
};

// Дефолтный тултип
const DefaultTooltip = ({ active, payload, label }: TooltipProps<any, any>) => {
  if (!active || !payload || payload.length === 0) return null;

  const timestamp = payload[0]?.payload?.timestamp;

  return (
    <div className="bg-background/95 border border-default-200 rounded-lg p-3 shadow-lg backdrop-blur-sm">
      <p className="text-sm font-semibold mb-2">{timestamp || label}</p>
      {payload.map((entry: any, index: number) => {
        // Пропускаем min/max поля от confidence
        if (entry.dataKey?.includes('_min') || entry.dataKey?.includes('_max')) {
          return null;
        }

        return (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-default-600">{entry.name}:</span>
            <span className="font-semibold">{entry.value?.toFixed(6)}</span>
          </div>
        );
      })}
    </div>
  );
};
