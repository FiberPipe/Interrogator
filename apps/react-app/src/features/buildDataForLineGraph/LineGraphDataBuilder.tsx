import { LineGraphWithCheckbox } from "../../entities/LineGraphWithCheckbox/LineGraphWithCheckbox";
import { LineGraph } from "../../shared/ui/LineGraph/LineGraph";

type TData = {
  name: string;
  id: number;
  time: string;
  wavelength: number;
  displacement: number;
  potPin1: number;
  potPin2: number;
};

type TTransformedData = {
  name: string;
  [key: string]: string | number;
};

export const LineGraphDataBuilder = () => {
  const data: any = [
    {
      id: 1,
      time: "00:00:00.000",
      wavelength: 1558.72,
      displacement: -7.6e-5,
      potPin1: 0.221896,
      potPin2: 0.151515,
    },
    {
      id: 2,
      time: "00:00:00.000",
      wavelength: 1558.725,
      displacement: -7.6e-5,
      potPin1: 0.221896,
      potPin2: 0.151515,
    },
    {
      id: 1,
      time: "00:00:02.103",
      wavelength: 1558.722,
      displacement: -7.6e-5,
      potPin1: 0.221896,
      potPin2: 0.151515,
    },
    {
      id: 2,
      time: "00:00:02.103",
      wavelength: 1558.719,
      displacement: -7.6e-5,
      potPin1: 0.221896,
      potPin2: 0.151515,
    },
    {
      id: 1,
      time: "00:00:05.257",
      wavelength: 1558.73,
      displacement: -7.6e-5,
      potPin1: 0.221896,
      potPin2: 0.151515,
    },
    {
      id: 2,
      time: "00:00:05.257",
      wavelength: 1558.733,
      displacement: -7.6e-5,
      potPin1: 0.221896,
      potPin2: 0.151515,
    },
    {
      id: 1,
      time: "00:00:07.359",
      wavelength: 1558.728,
      displacement: -7.5e-5,
      potPin1: 0.220919,
      potPin2: 0.151515,
    },
    {
      id: 2,
      time: "00:00:07.359",
      wavelength: 1558.725,
      displacement: -7.5e-5,
      potPin1: 0.220919,
      potPin2: 0.151515,
    },
  ];

  // Функция для группировки данных по времени
  const transformData = (data: TData[]): TTransformedData[] => {
    const groupedData: { [key: string]: { [key: number]: number } } = {};

    // Группируем данные по времени
    data.forEach((item) => {
      if (!groupedData[item.time]) {
        groupedData[item.time] = {};
      }
      groupedData[item.time][item.id] = item.wavelength; // Используем potPin1 как пример данных
    });

    // Преобразуем сгруппированные данные в нужный формат
    return Object.keys(groupedData).map((time) => ({
      name: time,
      ...groupedData[time],
    }));
  };

  const transformedData = transformData(data);

  return <LineGraphWithCheckbox names={[1, 2]} data={transformedData} />;
};
