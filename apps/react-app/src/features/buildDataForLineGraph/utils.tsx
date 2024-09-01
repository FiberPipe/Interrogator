import { TData } from "../../shared";
import { OutputRecord, ProcessedData } from "./types";


export const processSensorData = (data: TData[]): ProcessedData => {
  const timeDict: Record<string, Partial<Record<number, number>>> = {};
  const lastValues: Partial<Record<number, Record<string, number>>> = {};

  const uniqueIdsSet = new Set<number>();

  data.forEach(record => {
    const time = record.time;
    const id = record.id;
    const value = record.wavelength;

    uniqueIdsSet.add(id);

    if (!timeDict[time]) {
      timeDict[time] = {};
    }

    if (!lastValues[id]) {
      lastValues[id] = {};
    }
    lastValues[id]![time] = value;
    timeDict[time][id] = value;
  });

  const times = Object.keys(timeDict).sort();

  const resultData: OutputRecord[] = times.map(time => {
    const entry: OutputRecord = { name: time };
    const currentValues = timeDict[time];

    for (const id in lastValues) {
      const previousTimes = Object.keys(lastValues[+id]!).filter(t => t <= time).sort();
      const lastTime = previousTimes.length > 0 && previousTimes[previousTimes.length - 1];

      if (lastTime && lastValues[+id]![lastTime] !== undefined) {
        entry[id] = lastValues[+id]![lastTime];
      }
    }

    return entry;
  });

  const filteredResultData = resultData.filter(entry => Object.keys(entry).length > 1);
  const uniqueIds = Array.from(uniqueIdsSet).sort((a, b) => a - b);

  return { uniqueIds, resultData: filteredResultData };
};