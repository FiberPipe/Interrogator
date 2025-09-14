import { TData } from "../../shared";
import { ProcessedData, OutputRecord } from "./types";

export const processSensorData = (data: TData[]): ProcessedData => {
  const timeDict: Record<string, Record<string, number>> = {};
  const uniqueKeys = new Set<string>(); // P0, P1..., stdDev0...

  data.forEach((record) => {
    const time = record.time;

    if (!timeDict[time]) timeDict[time] = {};

    Object.keys(record).forEach((key) => {
      if (key.startsWith("P")) {
        const value = Number(record[key as keyof typeof record]);
        if (!isNaN(value)) {
          timeDict[time][key] = value;
          uniqueKeys.add(key);
        }
      }
    });
  });

  const times = Object.keys(timeDict).sort();

  const resultData: OutputRecord[] = times.map((time) => ({
    name: time,
    ...timeDict[time],
  }));

  return {
    uniqueIds: Array.from(uniqueKeys).sort(), // P0, P1, ..., stdDev0...
    resultData,
  };
};
