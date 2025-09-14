import { TData } from "../../shared";
import { OutputRecord, ProcessedData } from "./types";

export const processSensorData = (data: TData[]): ProcessedData => {
  const timeDict: Record<string, Record<string, number>> = {};
  const uniqueKeys = new Set<string>();

  data.forEach((record) => {
    const time = record.time;
    if (!time) return;
    if (!timeDict[time]) timeDict[time] = {};

    Object.keys(record).forEach((key) => {
      // только wavelength{index}
      const match = key.match(/^wavelength(\d+)$/);
      if (!match) return;

      const value = Number(record[key as keyof typeof record]);
      if (!isNaN(value)) {
        timeDict[time][key] = value;
        uniqueKeys.add(key);
      }
    });
  });

  const times = Object.keys(timeDict).sort();

  const resultData: OutputRecord[] = times.map((time) => ({
    name: time,
    ...timeDict[time],
  }));

  return {
    uniqueIds: Array.from(uniqueKeys).sort(), // ["wavelength0", "wavelength1", ...]
    resultData,
  };
};
