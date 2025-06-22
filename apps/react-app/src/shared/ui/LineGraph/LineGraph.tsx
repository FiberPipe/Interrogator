import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Brush,
  ComposedChart,
} from "recharts";
import { lineColorDict } from "./const";
import { TTransformedData } from "../../types";

type Props = {
  names: string[] | number[];
  data: TTransformedData[];
  sensorsConstraints: { [key: string]: string };
};

const calculateNumericAverages = (data: TTransformedData[]) => {
  const sums: { [key: string]: number } = {};
  const counts: { [key: string]: number } = {};

  data.forEach((entry) => {
    Object.keys(entry).forEach((key) => {
      //@ts-ignore
      const value = parseFloat(entry[key]);

      if (!isNaN(value)) {
        if (!sums[key]) {
          sums[key] = 0;
          counts[key] = 0;
        }
        sums[key] += value;
        counts[key] += 1;
      }
    });
  });

  const averages: { [key: string]: number } = {};
  Object.keys(sums).forEach(
    (key) => (averages[`avg_${key}`] = sums[key] / counts[key])
  );

  return averages;
};

const getConstraintKey = (id: number | string, type: "max" | "min") =>
  `wl_${id}_${type}`;

const getAvgKey = (id: number | string) => `avg_${id}`;

export const LineGraph: React.FC<Props> = ({
  names = [],
  data,
  sensorsConstraints,
}) => {
  const averageValues = calculateNumericAverages(data);
  const renderedData = data.map((entry) => ({
    ...entry,
    ...sensorsConstraints,
    ...averageValues,
  }));

  // Состояние для временных значений диапазона (мин и макс)
  const [tempMin, setTempMin] = useState<number>(0);
  const [tempMax, setTempMax] = useState<number>(10);

  const [yAxisDomain, setYAxisDomain] = useState<[number, number]>([0, 10]); // Изначально выставляем, как [0, 10] для демонстрации
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startY, setStartY] = useState<number>(0);
  const [startDomain, setStartDomain] = useState<[number, number]>([0, 10]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Обработчик изменения минимального значения
  const handleMinChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTempMin(Number.parseFloat(event.target.value));
  };

  // Обработчик изменения максимального значения
  const handleMaxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTempMax(Number.parseFloat(event.target.value));
  };

  // Обработчик применения нового диапазона
  const applyRange = () => {
    if (tempMin < tempMax) {
      setYAxisDomain([tempMin, tempMax]);
    } else {
      alert("Минимальное значение должно быть меньше максимального.");
    }
  };

  useEffect(() => {
    console.log(
      "Средние арифметические значения добавлены в данные:",
      renderedData
    );
  }, [renderedData]);

  const handleWheel = useCallback((event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const delta = event.deltaY;
    const zoomFactor = 0.1;

    setYAxisDomain(([min, max]) => {
      const range = max - min;
      const newRange =
        delta > 0 ? range * (1 + zoomFactor) : range * (1 - zoomFactor);
      const center = (min + max) / 2;
      return [center - newRange / 2, center + newRange / 2];
    });
  }, []);

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button === 0) {
      setIsDragging(true);
      setStartY(event.clientY);
      setStartDomain(yAxisDomain);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      const moveDistance = event.clientY - startY;
      const shiftFactor = moveDistance / 100;

      setYAxisDomain(([min, max]) => {
        const range = max - min;
        return [
          startDomain[0] + shiftFactor * range,
          startDomain[1] + shiftFactor * range,
        ];
      });
    }
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      style={{ position: "relative", width: "100%", height: "100%" }}
    >
      <div style={{ position: "absolute", top: 10, right: 10, zIndex: 1000 }}>
        <div style={{ marginBottom: 5 }}>
          <label>
            Min:
            <input
              defaultValue={tempMax}
              onChange={handleMinChange}
              style={{ marginLeft: 5, width: 80 }}
              type="text"
            />
          </label>
        </div>
        <div style={{ marginBottom: 5 }}>
          <label>
            Max:
            <input
              // value={tempMax}
              defaultValue={tempMax}
              onChange={handleMaxChange}
              style={{ marginLeft: 5, width: 80 }}
              type="text"
            />
          </label>
        </div>
        <button onClick={applyRange} style={{ width: "100%" }}>
          Применить
        </button>
      </div>

      <ResponsiveContainer>
        <ComposedChart
          data={renderedData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          {/* Автоматическое масштабирование */}
          <YAxis domain={yAxisDomain} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Brush dataKey="name" height={30} stroke="#8884d8" />

          {names.map((key: string | number) => (
            <Line
              key={key}
              dataKey={key}
              type="monotone"
              stroke={lineColorDict[Number(key) % lineColorDict.length]}
              strokeWidth={2}
              activeDot={{ r: 8 }}
            />
          ))}

          {names.map((key: string | number) => (
            <Line
              key={getConstraintKey(key, "max")}
              dataKey={getConstraintKey(key, "max")}
              type="monotone"
              stroke={lineColorDict[Number(key) % lineColorDict.length]}
              strokeWidth={2}
              activeDot={{ r: 8 }}
              strokeDasharray="5 5"
            />
          ))}

          {names.map((key: string | number) => (
            <Line
              key={getConstraintKey(key, "min")}
              dataKey={getConstraintKey(key, "min")}
              type="monotone"
              stroke={lineColorDict[Number(key) % lineColorDict.length]}
              strokeWidth={2}
              activeDot={{ r: 8 }}
              strokeDasharray="5 5"
            />
          ))}

          {names.map((key: string | number) => (
            <Line
              key={getAvgKey(key)}
              dataKey={getAvgKey(key)}
              type="monotone"
              stroke={lineColorDict[Number(key) % lineColorDict.length]}
              strokeWidth={2}
              activeDot={{ r: 8 }}
              strokeDasharray="5 5"
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
