import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
} from "recharts";
import { Slider, Button } from "@heroui/react";
import React from "react";
import { ZoomableChart } from "./ZoomableChart";

interface SeriesData {
  key: string;
  color?: string;
  data: { x: number | string; y: number; yMin?: number; yMax?: number }[];
  showConfidence?: boolean;
}

interface LineChartWithConfidenceProps {
  series: SeriesData[];
  height?: number;
}

export const LineChartWithConfidence = ({
  series,
  height = 400,
}: LineChartWithConfidenceProps) => {
  const [range, setRange] = useState<[number, number]>([0, series[0]?.data.length - 1]);
  const [selectedSeriesKeys, setSelectedSeriesKeys] = useState<string[]>(series.map(s => s.key));

  const handleToggleSeries = (key: string) => {
    setSelectedSeriesKeys(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleSelectAll = () => setSelectedSeriesKeys(series.map(s => s.key));
  const handleDeselectAll = () => setSelectedSeriesKeys([]);

  const visibleData = series[0]?.data.slice(range[0], range[1] + 1) ?? [];

  return (
    <div className="flex flex-col gap-2">
      {/* Панель управления линиями */}
      <div className="flex flex-wrap items-center gap-2 text-sm mb-1">
        {series.map(s => (
          <Button
            key={s.key}
            variant={selectedSeriesKeys.includes(s.key) ? "solid" : "flat"}
            color={selectedSeriesKeys.includes(s.key) ? "primary" : "default"}
            size="sm"
            onPress={() => handleToggleSeries(s.key)}
          >
            {s.key}
          </Button>
        ))}
        <Button variant="flat" size="sm" onPress={handleSelectAll}>Все</Button>
        <Button variant="flat" size="sm" onPress={handleDeselectAll}>Снять</Button>
      </div>

      {/* График */}
      <div style={{ width: "100%", height }}>
        <ZoomableChart series={series}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={visibleData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              {series.map(s => {
                if (!selectedSeriesKeys.includes(s.key)) return null;

                const confidenceArea = s.showConfidence
                  ? [
                    <Area
                      key={`${s.key}-max`}
                      type="monotone"
                      dataKey="yMax"
                      stroke="none"
                      fill={s.color}
                      fillOpacity={0.2}
                      activeDot={false}
                    />,
                    <Area
                      key={`${s.key}-min`}
                      type="monotone"
                      dataKey="yMin"
                      stroke="none"
                      fill="#fff"
                      activeDot={false}
                    />
                  ]
                  : [];

                return (
                  <React.Fragment key={s.key}>
                    {confidenceArea}
                    <Line
                      type="monotone"
                      dataKey="y"
                      data={s.data.slice(range[0], range[1] + 1)}
                      stroke={s.color ?? "#4f46e5"}
                      dot={false}
                    />
                  </React.Fragment>
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </ZoomableChart>
      </div>

      {/* Таймлайн */}
      <Slider
        label=""
        minValue={0}
        maxValue={series[0]?.data.length - 1 ?? 0}
        value={range}
        onChange={(val) => setRange(val as [number, number])}
        step={1}
        range
      />
    </div>
  );
};
