import { TData } from "../../shared";

export const FBG_HEADER_CELL_NAMES = [
  "ID",
  "λ₀ (нм)",
  "E (°С/нм⁴)",
  "D (°С/нм³)",
  "C (°С/нм²)",
  "B (°С/нм)",
  "A (°С)",
  "Result (°С)",
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
