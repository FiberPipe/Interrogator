import { TData } from "../../shared";
import { OutputRecord, ProcessedData } from "./types";

const sortByNumericSuffix = (a: string, b: string) => {
  const na = Number((a.match(/\d+$/) || ["0"])[0]);
  const nb = Number((b.match(/\d+$/) || ["0"])[0]);
  return na - nb;
};

export const processSensorData = (data: TData[]): ProcessedData => {
  const timeDict: Record<string, Record<string, number>> = {};
  const uniqueKeys = new Set<string>();

  data.forEach((record) => {
    const time = (record as any).time;
    if (!time) return;
    if (!timeDict[time]) timeDict[time] = {};

    Object.keys(record).forEach((key) => {
      // только wavelength{index}
      if (!/^wavelength\d+$/.test(key)) return;
      const value = Number((record as any)[key]);
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
    uniqueIds: Array.from(uniqueKeys).sort(sortByNumericSuffix),
    resultData,
  };
};
