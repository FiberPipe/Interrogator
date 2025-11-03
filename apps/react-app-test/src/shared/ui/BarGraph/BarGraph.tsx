import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import React, { useState, useCallback, useRef, useEffect } from "react";
import { TBarGraphTransformedData } from "../../types";
import { RangeControl } from "../../../entities/RangeControl";

type Props = {
  data: TBarGraphTransformedData[][];
};

export const BarGraph: React.FC<Props> = ({ data }) => {
  // Состояние для ручного управления масштабом оси Y
  const [yAxisDomain, setYAxisDomain] = useState<[number, number]>([0, 10]);

  // Состояние для отслеживания перетаскивания
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startY, setStartY] = useState<number>(0);
  const [startDomain, setStartDomain] = useState<[number, number]>([0, 10]);

  // Флаг инициализации данных
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Ref для контейнера графика
  const containerRef = useRef<HTMLDivElement>(null);

  // Инициализация диапазона при первой загрузке данных
  useEffect(() => {
    if (data.length > 0 && !isInitialized) {
      // Найдем все числовые значения для определения минимума и максимума
      const allValues: number[] = [];

      data.forEach(dataSet => {
        dataSet.forEach(item => {
          if (typeof item.value === 'number' && !isNaN(item.value)) {
            allValues.push(item.value);
          }
        });
      });

      if (allValues.length > 0) {
        const min = Math.min(...allValues);
        const max = Math.max(...allValues);

        // Добавляем небольшой запас для визуального комфорта
        const padding = (max - min) * 0.1;
        setYAxisDomain([Math.max(0, min - padding), max + padding]);
        setStartDomain([Math.max(0, min - padding), max + padding]);
        setIsInitialized(true);
      }
    }
  }, [data, isInitialized]);

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

  // Обработчик начала перетаскивания (зажатие кнопки мыши)
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

        // Масштабируем изменение позиции мыши к диапазону оси Y
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

  // Обработчик окончания перетаскивания (отпускание кнопки мыши)
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

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
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <RangeControl
        initialMin={yAxisDomain[0]}
        initialMax={yAxisDomain[1]}
        onRangeChange={handleRangeChange}
        isInitialized={isInitialized}
      />

      {/* Контейнер для графиков */}
      <div
        ref={containerRef}
        style={{ flex: 1 }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
      >
        {data.map((dataItem, index) => (
          <ResponsiveContainer key={`chart-${index}`} width="100%" height={600} style={{ marginTop: '20px', marginBottom: '20px' }}>
            <BarChart
              width={500}
              height={300}
              data={dataItem}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
              barSize={20}
            >
              <XAxis
                dataKey="name"
                scale="point"
                padding={{ left: 10, right: 10 }}
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
              />
              <YAxis
                domain={yAxisDomain}
                allowDataOverflow={true}
                tick={{ fontSize: 12 }}
              />
              <Tooltip />
              <Legend />
              <CartesianGrid strokeDasharray="3 3" />

              <Bar
                dataKey="value"
                fill="#8884d8" // Цвет столбцов
              />
            </BarChart>
          </ResponsiveContainer>
        ))}
      </div>
    </div>
  );
};
