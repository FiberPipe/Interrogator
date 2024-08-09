import { TData } from "../../shared";

export const WL_HEADER_CELL_NAMES = [
  "ID",
  "",
  "Range min",
  "Alarm min",
  "Current",
  "Alarm max",
  "Range max",
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
      const { id, wavelength } = item;

      if (!acc[id]) {
        acc[id] = [];
      }

      acc[id].push(wavelength);

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
