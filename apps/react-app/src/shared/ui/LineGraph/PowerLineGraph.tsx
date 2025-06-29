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
  Area,
} from "recharts";
import React, { useState, useCallback, useRef, useEffect } from "react";
import { TTransformedData } from "../../types";
import { RangeControl } from "../../../entities/RangeControl";

type Props = {
  names: string[];
  data: TTransformedData[];
  sensorsConstraints: { [key: string]: string };
};

const lineColorDict = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#387908",
  "#ff7001",
];

export const LineGraph: React.FC<Props> = ({
  names = [],
  data,
  sensorsConstraints,
}) => {
  // Состояние для ручного управления масштабом оси OY
  const [yAxisDomain, setYAxisDomain] = useState<[number, number]>([0, 10]);

  // Состояние для отслеживания перемещения мыши
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startY, setStartY] = useState<number>(0);
  const [startDomain, setStartDomain] = useState<[number, number]>([0, 10]);

  // Флаг инициализации данных
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Ref для контейнера графика
  const containerRef = useRef<HTMLDivElement>(null);

  // Добавление ограничения для отображаемых данных
  const renderedData = data.map((entry) => ({
    ...entry,
    ...sensorsConstraints,
  }));

  // Инициализация диапазона при первой загрузке данных
  useEffect(() => {
    if (data.length > 0 && !isInitialized) {
      // Найдем все числовые значения для определения минимума и максимума
      const allValues: number[] = [];

      data.forEach(entry => {
        names.forEach(key => {
          const value = typeof entry[key] === 'string'
            ? parseFloat(entry[key] as string)
            : entry[key] as number;

          if (!isNaN(value)) {
            allValues.push(value);
          }
        });
      });

      if (allValues.length > 0) {
        const min = Math.min(...allValues);
        const max = Math.max(...allValues);

        // Добавляем небольшой запас для визуального комфорта
        const padding = (max - min) * 0.1;
        setYAxisDomain([min - padding, max + padding]);
        setStartDomain([min - padding, max + padding]);
        setIsInitialized(true);
      }
    }
  }, [data, names, isInitialized]);

  console.log("Processed Data for Power Graph:", data, names);

  // Обработчик события прокрутки колесика мыши
  const handleWheel = useCallback((event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault(); // Отключаем стандартное поведение прокрутки
    const delta = event.deltaY; // Получаем значение прокрутки
    const zoomFactor = 0.1; // Коэффициент масштабирования

    setYAxisDomain(([min, max]) => {
      const range = max - min;
      const newRange =
        delta > 0 ? range * (1 + zoomFactor) : range * (1 - zoomFactor); // Увеличиваем или уменьшаем диапазон
      const center = (min + max) / 2; // Центр текущего диапазона
      const newMin = center - newRange / 2;
      const newMax = center + newRange / 2;
      return [newMin, newMax];
    });
  }, []);

  // Обработчик изменения диапазона из компонента RangeControl
  const handleRangeChange = (min: number, max: number) => {
    setYAxisDomain([min, max]);
  };

  // Обработчик начала перемещения (зажатие кнопки мыши)
  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button === 0) {
      // Проверяем, что нажата левая кнопка мыши
      setIsDragging(true);
      setStartY(event.clientY);
      setStartDomain(yAxisDomain);
    }
  };

  // Обработчик перемещения мыши
  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (isDragging && containerRef.current) {
        const deltaY = event.clientY - startY; // Разница по оси Y
        const containerHeight = containerRef.current.clientHeight; // Высота контейнера
        const range = startDomain[1] - startDomain[0]; // Текущий диапазон

        // Масштабируем изменение позиции мыши к диапазону оси OY
        const deltaRange = (deltaY / containerHeight) * range;

        // Обновляем диапазон
        setYAxisDomain([
          startDomain[0] - deltaRange,
          startDomain[1] - deltaRange,
        ]);
      }
    },
    [isDragging, startY, startDomain]
  );

  // Обработчик окончания перемещения (отпускание кнопки мыши)
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Добавляем обработчики событий перемещения мыши
  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", width: '100%' }}>
      <RangeControl
        initialMin={yAxisDomain[0]}
        initialMax={yAxisDomain[1]}
        onRangeChange={handleRangeChange}
        isInitialized={isInitialized}
      />

      <div
        ref={containerRef}
        style={{ flex: 1 }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={renderedData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis
              domain={yAxisDomain}
              allowDataOverflow={true}
              tick={{ fontSize: 12 }}
            />
            <Tooltip />
            <Legend />
            <Brush dataKey="name" height={30} stroke="#8884d8" />

            {names.map((key, index) => (
              <Line
                key={key}
                dataKey={key}
                type="monotone"
                stroke={lineColorDict[index % lineColorDict.length]}
                strokeWidth={2}
                activeDot={{ r: 8 }}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
