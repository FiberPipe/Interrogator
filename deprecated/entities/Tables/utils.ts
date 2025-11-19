import { ReceivedData } from "../../shared";
import { GroupedPowerItem, GroupedWavelengthItem } from "./types";

export const groupDataByWavelengthId = (data: ReceivedData[]): GroupedWavelengthItem[] => {
  const groupedData: Record<number, number[]> = {};

  data.forEach((item) => {
    Object.keys(item).forEach((key) => {
      const idMatch = key.match(/^wavelength(\d+)$/);
      if (!idMatch) return;

      const sensorId = Number(idMatch[1]);
      const value = Number(item[key as keyof typeof item]);
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
      wavelength: values[values.length - 1],
      rangeMin: values.length ? Math.min(...values) : NaN,
      rangeMax: values.length ? Math.max(...values) : NaN,
    };
  });
};

export const groupDataByPowerId = (data: ReceivedData[]): GroupedPowerItem[] => {
  const groupedData: Record<number, number[]> = {};

  data.forEach((item) => {
    Object.keys(item).forEach((key) => {
      const idMatch = key.match(/^P(\d+)$/);
      if (!idMatch) return;

      const sensorId = Number(idMatch[1]);
      const value = Number(item[key as keyof typeof item]);
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
      currentValue: values[values.length - 1],
      rangeMin: values.length ? Math.min(...values) : NaN,
      rangeMax: values.length ? Math.max(...values) : NaN,
    };
  });
};


