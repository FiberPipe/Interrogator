import { SensorData } from "@shared/types/sensor-data";
import { TableGroupedItem } from "./types";

export const groupDataById = (data: SensorData[]): TableGroupedItem[] => {
  const groupedData = data.reduce(
    (acc: Record<number, number[]>, item: SensorData) => {
      const { idSensor, wavelength } = item;

      if (!acc[idSensor]) {
        acc[idSensor] = [];
      }

      acc[idSensor].push(wavelength);

      return acc;
    },
    {}
  );

  return Object.keys(groupedData).map((key: string) => {
    const wavelengths = groupedData[Number(key)];
    return {
      id: Number(key),
      wavelength: 0,
      rangeMin: Math.min(...wavelengths),
      rangeMax: Math.max(...wavelengths),
    };
  });
};