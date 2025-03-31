import { TData } from "../../shared";

export const DISPLACEMENT_HEADER_CELL_NAMES = [
  "ID",
  "λ₀ (нм)",
  "k",
  "C (мкм/(м·°C²))",
  "B (мкм/(м·°C))",
  "α (мкм/(м·°C))",
  "T (°C)",
  "T₀ (°C)",
  "Result (мкм/м)",
];

export type GroupedItem = {
  id: number;
  wavelength: number;
  rangeMin: number;
  rangeMax: number;
};

export const groupDataById = (data: TData[]): GroupedItem[] => {
  const groupedData = data.reduce(
    (acc: Record<number, number[]>, item: TData) => {
      const { id_sensor, wavelength } = item;

      if (!acc[id_sensor]) {
        acc[id_sensor] = [];
      }

      acc[id_sensor].push(wavelength);

      return acc;
    },
    {}
  );

  return Object.keys(groupedData).map((key: string) => {
    const wavelengths = groupedData[Number(key)];
    return {
      id: Number(key),
      wavelength: wavelengths[wavelengths.length - 1],
      rangeMin: Math.min(...wavelengths),
      rangeMax: Math.max(...wavelengths),
    };
  });
};
