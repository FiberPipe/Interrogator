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
  ReferenceLine,
} from "recharts";
import { lineColorDict } from "./const";
import { TTransformedData } from "../../types";
import { RangeControl } from "../../../entities/RangeControl";

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
      if (key === "name") return; // Пропускаем ключ "name"

      // Преобразуем значение в число
      const value = typeof entry[key] === 'string'
        ? parseFloat(entry[key] as string)
        : (entry[key] as number);

      if (!isNaN(value)) {
        const safeKey = String(key); // Преобразуем ключ в строку для безопасности
        if (!sums[safeKey]) {
          sums[safeKey] = 0;
          counts[safeKey] = 0;
        }
        sums[safeKey] += value;
        counts[safeKey] += 1;
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

// Новые отметки для графика (референсные значения)
const referenceValues = [1540.184, 1540.996, 1541.78, 1542.592];

export const LineGraph: React.FC<Props> = ({
  names = [],
  data,
  sensorsConstraints,
}) => {
  // Преобразуем строковые значения в числовые
  const processedData = data.map(entry => {
    const result = { ...entry };
    for (const key in result) {
      if (key !== "name" && typeof result[key] === 'string') {
        const numValue = parseFloat(result[key] as string);
        if (!isNaN(numValue)) {
          result[key] = numValue;
        }
      }
    }
    return result;
  });

  const averageValues = calculateNumericAverages(processedData);
  const renderedData = processedData.map((entry) => ({
    ...entry,
    ...sensorsConstraints,
    ...averageValues,
  }));

  // Инициализируем состояния с безопасными начальными значениями
  const [yAxisDomain, setYAxisDomain] = useState<[number, number]>([0, 10]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startY, setStartY] = useState<number>(0);
  const [startDomain, setStartDomain] = useState<[number, number]>([0, 10]);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Определяем диапазон Y оси только один раз при первом рендере
  useEffect(() => {
    if (processedData.length > 0 && !isInitialized) {
      // Находим все числовые значения из данных для определения min/max
      const allValues: number[] = [];

      processedData.forEach(entry => {
        Object.entries(entry).forEach(([key, value]) => {
          if (key !== "name") {
            const numValue = typeof value === 'string' ? parseFloat(value) : (value as number);
            if (!isNaN(numValue)) {
              allValues.push(numValue);
            }
          }
        });
      });

      // Добавляем референсные значения
      allValues.push(...referenceValues);

      if (allValues.length > 0) {
        const min = Math.min(...allValues);
        const max = Math.max(...allValues);

        // Устанавливаем все состояния за один раз
        setYAxisDomain([min, max]);
        setStartDomain([min, max]);
        setIsInitialized(true);
      }
    }
  }, [processedData, isInitialized]);

  // Обработчик применения нового диапазона из компонента RangeControl
  const handleRangeChange = (min: number, max: number) => {
    setYAxisDomain([min, max]);
  };

  useEffect(() => {
    console.log("Обработанные данные:", renderedData);
    console.log("Имена линий:", names);
  }, [renderedData, names]);

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

  const hasData = renderedData.length > 0;

  return (
    <div className="flex flex-col h-full" style={{ width: "100%", height: "100%" }}>
      <div className="flex mb-4">
        <RangeControl
          initialMin={yAxisDomain[0]}
          initialMax={yAxisDomain[1]}
          onRangeChange={handleRangeChange}
          isInitialized={isInitialized}
        />
      </div>

      {hasData ? (
        <div
          ref={containerRef}
          className="flex-grow"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseMove={handleMouseMove}
          style={{ height: "90%" }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={renderedData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                height={50}
                angle={-30}
                textAnchor="end"
              />
              <YAxis
                domain={yAxisDomain}
                tick={{ fontSize: 12 }}
                allowDataOverflow={true}
                width={80}
              />
              <Tooltip
                formatter={(value) => typeof value === 'number' ? value.toFixed(4) : value}
                contentStyle={{ fontWeight: 'bold' }}
              />
              <Legend
                wrapperStyle={{ fontWeight: 'bold' }}
              />
              <Brush dataKey="name" height={30} stroke="#8884d8" />

              {/* Основные линии данных - утолщенные */}
              {names.map((key) => {
                const stringKey = String(key);
                return (
                  <Line
                    key={`line-${stringKey}`}
                    name={`Sensor ${stringKey}`}
                    dataKey={stringKey}
                    type="monotone"
                    stroke={"#d62728"}
                    strokeWidth={3.5} // Увеличена толщина линии
                    activeDot={{ r: 10 }} // Увеличен размер активной точки
                    dot={{ r: 4 }} // Увеличены стандартные точки
                    connectNulls={true}
                    isAnimationActive={false}
                  />
                );
              })}

              {/* Ограничения макс - утолщенные */}
              {names.map((key) => {
                const stringKey = String(key);
                return (
                  <Line
                    key={`max-${getConstraintKey(key, "max")}`}
                    name={`Max ${stringKey}`}
                    dataKey={getConstraintKey(key, "max")}
                    type="monotone"
                    stroke={lineColorDict[Number(key) % lineColorDict.length]}
                    strokeWidth={2.5} // Увеличена толщина линии
                    strokeDasharray="10 5" // Более заметный пунктир
                    connectNulls={true}
                    isAnimationActive={false}
                  />
                );
              })}

              {/* Ограничения мин - утолщенные */}
              {names.map((key) => {
                const stringKey = String(key);
                return (
                  <Line
                    key={`min-${getConstraintKey(key, "min")}`}
                    name={`Min ${stringKey}`}
                    dataKey={getConstraintKey(key, "min")}
                    type="monotone"
                    stroke={lineColorDict[Number(key) % lineColorDict.length]}
                    strokeWidth={2.5} // Увеличена толщина линии
                    strokeDasharray="10 5" // Более заметный пунктир
                    connectNulls={true}
                    isAnimationActive={false}
                  />
                );
              })}

              {/* Средние значения - утолщенные */}
              {names.map((key) => {
                const stringKey = String(key);
                return (
                  <Line
                    key={`avg-${getAvgKey(key)}`}
                    name={`Avg ${stringKey}`}
                    dataKey={getAvgKey(key)}
                    type="monotone"
                    stroke={lineColorDict[Number(key) % lineColorDict.length]}
                    strokeWidth={2.5} // Увеличена толщина линии
                    strokeDasharray="10 5" // Более заметный пунктир
                    connectNulls={true}
                    isAnimationActive={false}
                  />
                );
              })}

              {/* Референсные линии - утолщенные */}
              {referenceValues.map((value, index) => (
                <ReferenceLine
                  key={`ref-line-${index}`}
                  y={value}
                  stroke={"#1f77b4"}
                  strokeWidth={2} // Увеличена толщина линии
                  strokeDasharray="7 7" // Более заметный пунктир
                  label={{
                    value: value.toFixed(3),
                    position: 'insideRight',
                    fill: "#1f77b4",
                    fontSize: 14, // Увеличен размер шрифта
                    fontWeight: 'bold'
                  }}
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex items-center justify-center flex-grow">
          Нет данных для отображения
        </div>
      )}
    </div>
  );
};
