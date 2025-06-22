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
import React, { useState, useCallback, useRef } from "react";
import { TTransformedData } from "../../types";

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

  // Состояние для временных значений диапазона (мин и макс)
  const [tempMin, setTempMin] = useState<number>(0);
  const [tempMax, setTempMax] = useState<number>(10);

  // Состояние для отслеживания перемещения мыши
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startY, setStartY] = useState<number>(0);
  const [startDomain, setStartDomain] = useState<[number, number]>([0, 10]);

  // Ref для контейнера графика
  const containerRef = useRef<HTMLDivElement>(null);

  // Добавление ограничения для отображаемых данных
  const renderedData = data.map((entry) => ({
    ...entry,
    ...sensorsConstraints,
  }));

  console.log("Processed Data for Power Graph:", data, names);

  // Создаем массив для областей stdev
  // const stdevAreas = [];
  // for (const key of names) {
  //   if (key.startsWith("P")) {
  //     const stdevKey = `stdDev${key.slice(1)}`; // Получаем соответствующий stdDev
  //     if (renderedData[0][stdevKey] !== undefined) {
  // Добавляем область для stdev
  // stdevAreas.push(
  //   <Area
  //     key={`${key}-area`}
  //     dataKey={(entry) => entry[key] + entry[stdevKey] / 2}
  //     stroke="none"
  //     fill="#ff7300"
  //     fillOpacity={0.2}
  //     isAnimationActive={false}
  //   />,
  //   <Area
  //     key={`${key}-area-lower`}
  //     dataKey={(entry) => entry[key] - entry[stdevKey] / 2}
  //     stroke="none"
  //     fill="#ff7300"
  //     fillOpacity={0.2}
  //     isAnimationActive={false}
  //   />
  // );
  //     }
  //   }
  // }

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
    <div
      style={{ position: "relative", width: "100%", height: "100%" }}
      onWheel={handleWheel} // Добавляем обработчик события прокрутки
      onMouseDown={handleMouseDown} // Добавляем обработчик начала перемещения
      ref={containerRef} // Ref для контейнера
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

          {/* Отображаем области stdev */}
          {/* {stdevAreas} */}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
