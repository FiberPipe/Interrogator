import { useState } from 'react';
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
import { ChartSeries } from '../../../entities/chart/model/types';

interface LineChartWithConfidenceProps {
  series: ChartSeries[];
  height?: number;
}

export const LineChartWithConfidence = ({ series, height = 400 }: LineChartWithConfidenceProps) => {
  const maxDataLength = series[0]?.data.length || 0;
  const [range, setRange] = useState<[number, number]>([
    Math.max(0, maxDataLength - 50),
    maxDataLength - 1,
  ]);

  // Обновляем range когда приходят новые данные
  React.useEffect(() => {
    if (maxDataLength > 0) {
      setRange([Math.max(0, maxDataLength - 50), maxDataLength - 1]);
    }
  }, [maxDataLength]);

  const visibleData = series[0]?.data.slice(range[0], range[1] + 1) ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={visibleData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="x"
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
              label={{ value: 'Sample', position: 'insideBottom', offset: -5 }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
              label={{ value: 'Power (W)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px',
              }}
            />
            <Legend />
            
            {series.map((s) => {
              const confidenceArea = s.showConfidence
                ? [
                    <Area
                      key={`${s.key}-area`}
                      type="monotone"
                      dataKey="yMax"
                      data={s.data.slice(range[0], range[1] + 1)}
                      stroke="none"
                      fill={s.color}
                      fillOpacity={0.1}
                      activeDot={false}
                    />,
                    <Area
                      key={`${s.key}-area-min`}
                      type="monotone"
                      dataKey="yMin"
                      data={s.data.slice(range[0], range[1] + 1)}
                      stroke="none"
                      fill="#fff"
                      activeDot={false}
                    />,
                  ]
                : [];

              return (
                <React.Fragment key={s.key}>
                  {confidenceArea}
                  <Line
                    type="monotone"
                    dataKey="y"
                    data={s.data.slice(range[0], range[1] + 1)}
                    stroke={s.color}
                    strokeWidth={2}
                    dot={false}
                    name={s.label}
                    animationDuration={300}
                  />
                </React.Fragment>
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <Slider
        size="sm"
        minValue={0}
        maxValue={maxDataLength > 0 ? maxDataLength - 1 : 0}
        value={range}
        onChange={(val) => setRange(val as [number, number])}
        step={1}
        className="max-w-full"
        label="Диапазон отображения"
      />
    </div>
  );
};
