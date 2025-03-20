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
import React, { useState, useCallback, useRef } from "react";
import { TBarGraphTransformedData } from "../../types";

type Props = {
  data: TBarGraphTransformedData[];
};

export const BarGraph: React.FC<Props> = ({ data }) => {
  // Состояние для ручного управления масштабом оси Y
  const [yAxisDomain, setYAxisDomain] = useState<[number, number]>([0, 10]);

  // Состояние для временных значений диапазона (мин и макс)
  const [tempMin, setTempMin] = useState<number>(0);
  const [tempMax, setTempMax] = useState<number>(10);

  // Состояние для отслеживания перетаскивания
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startY, setStartY] = useState<number>(0);
  const [startDomain, setStartDomain] = useState<[number, number]>([0, 10]);

  // Ref для контейнера графика
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Обработчик изменения минимального значения
  const handleMinChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTempMin(Number(event.target.value));
  };

  // Обработчик изменения максимального значения
  const handleMaxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTempMax(Number(event.target.value));
  };

  // Обработчик применения нового диапазона
  const applyRange = () => {
    if (tempMin < tempMax) {
      setYAxisDomain([tempMin, tempMax]);
    } else {
      alert("Минимальное значение должно быть меньше максимального.");
    }
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
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      style={{ position: "relative", width: "100%", height: "100%" }}
      onWheel={handleWheel} // Добавляем обработчик события прокрутки
      onMouseDown={handleMouseDown} // Добавляем обработчик начала перетаскивания
      ref={containerRef} // Ref для контейнера
    >
      {/* Поля ввода для выбора диапазона */}
      <div style={{ position: "absolute", top: 10, right: 10, zIndex: 1000 }}>
        <div style={{ marginBottom: 5 }}>
          <label>
            Min:
            <input
              type="number"
              value={tempMin}
              onChange={handleMinChange}
              style={{ marginLeft: 5, width: 80 }}
            />
          </label>
        </div>
        <div style={{ marginBottom: 5 }}>
          <label>
            Max:
            <input
              type="number"
              value={tempMax}
              onChange={handleMaxChange}
              style={{ marginLeft: 5, width: 80 }}
            />
          </label>
        </div>
        <button onClick={applyRange} style={{ width: "100%" }}>
          Применить
        </button>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          width={500}
          height={300}
          data={data}
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

          {/* Отображаем столбец для значения value */}
          <Bar
            dataKey="value"
            fill="#8884d8" // Цвет столбцов
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
