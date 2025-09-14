import { TData } from "../shared";

export type GroupedItem = {
  id: number;
  wavelength: number;
  rangeMin: number;
  rangeMax: number;
};


export const groupDataById = (data: TData[]): GroupedItem[] => {
  const groupedData: Record<number, number[]> = {};

  data.forEach((item) => {
    Object.keys(item).forEach((key) => {
      const idMatch = key.match(/^wavelength(\d+)$/);
      if (!idMatch) return;

      const sensorId = Number(idMatch[1]);
      const value = Number(item[key]);
      if (isNaN(value)) return;

      if (!groupedData[sensorId]) groupedData[sensorId] = [];
      groupedData[sensorId].push(value);
    });
  });

  return Object.keys(groupedData).map((key) => {
    const id = Number(key);
    const values = groupedData[id];
    return {
      id,
      wavelength: values[values.length - 1], // последняя запись
      rangeMin: values.length ? Math.min(...values) : NaN,
      rangeMax: values.length ? Math.max(...values) : NaN,
    };
  });
};

