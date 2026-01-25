import { useState, useEffect, useMemo } from 'react';
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
} from 'recharts';
import { Slider } from '@heroui/react';
import React from 'react';

export interface ChartDataPoint {
  x: number | string; // Поддержка и числовых индексов, и временных меток
  y: number;
  yMin?: number;
  yMax?: number;
  timestamp?: string; // Опциональная временная метка для отображения
  [key: string]: any; // Дополнительные поля
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

interface LineChartWithConfidenceProps {
  series: ChartSeries[];
  height?: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
  xAxisDataKey?: string; // Какое поле использовать для X оси
  enableZoom?: boolean;
  defaultVisiblePoints?: number;
  showLegend?: boolean;
  customTooltip?: React.ComponentType<TooltipProps<any, any>>;
}

export const LineChartWithConfidence = ({
  series,
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

  const [range, setRange] = useState<[number, number]>([
    Math.max(0, maxDataLength - defaultVisiblePoints),
    maxDataLength - 1,
  ]);

  // Автоматически обновляем range при поступлении новых данных
  useEffect(() => {
    if (maxDataLength > 0) {
      const start = Math.max(0, maxDataLength - defaultVisiblePoints);
      const end = maxDataLength - 1;
      setRange([start, end]);
    }
  }, [maxDataLength, defaultVisiblePoints]);

  // Подготавливаем данные для отображения - объединяем все серии в один массив
  const chartData = useMemo(() => {
    if (series.length === 0 || maxDataLength === 0) return [];

    const start = range[0];
    const end = range[1];
    const length = end - start + 1;

    // Создаем массив точек данных
    const result: any[] = [];

    for (let i = 0; i < length; i++) {
      const globalIndex = start + i;
      const dataPoint: any = {};

      // Добавляем данные из каждой серии
      series.forEach((s) => {
        if (s.data[globalIndex]) {
          const point = s.data[globalIndex];

          // X координата (используем из первой серии)
          if (!dataPoint[xAxisDataKey]) {
            dataPoint[xAxisDataKey] = point[xAxisDataKey] || point.x;
          }

          // Временная метка для тултипа
          if (!dataPoint.timestamp && point.timestamp) {
            dataPoint.timestamp = point.timestamp;
          }

          // Y значения
          dataPoint[s.key] = point.y;

          // Confidence интервалы
          if (s.showConfidence && point.yMin !== undefined && point.yMax !== undefined) {
            dataPoint[`${s.key}_min`] = point.yMin;
            dataPoint[`${s.key}_max`] = point.yMax;
          }
        }
      });

      result.push(dataPoint);
    }

    return result;
  }, [series, range, maxDataLength, xAxisDataKey]);

  // Форматирование X оси
  const formatXAxis = (value: any) => {
    // Если это временная метка
    if (typeof value === 'string' && value.includes(':')) {
      return value;
    }
    // Если это число
    return value;
  };

  const TooltipComponent = customTooltip || DefaultTooltip;

  return (
    <div className="flex flex-col gap-4 w-full">
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
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
              width={60}
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

            {/* Отрисовка серий */}
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

      {/* Zoom slider */}
      {enableZoom && maxDataLength > defaultVisiblePoints && (
        <Slider
          size="sm"
          minValue={0}
          maxValue={Math.max(0, maxDataLength - 1)}
          value={range}
          onChange={(val) => setRange(val as [number, number])}
          step={1}
          className="max-w-full"
          label="Диапазон отображения"
          showTooltip
          tooltipValueFormatOptions={{
            formatter: (val: number) => `${val}`,
          }}
        />
      )}
    </div>
  );
};

// Дефолтный тултип
const DefaultTooltip = ({ active, payload, label }: TooltipProps<any, any>) => {
  if (!active || !payload || payload.length === 0) return null;

  const timestamp = payload[0]?.payload?.timestamp;

  return (
    <div className="bg-background/95 border border-default-200 rounded-lg p-3 shadow-lg">
      <p className="text-sm font-semibold mb-2">{timestamp || label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-default-600">{entry.name}:</span>
          <span className="font-semibold">{entry.value?.toFixed(6)}</span>
        </div>
      ))}
    </div>
  );
};
