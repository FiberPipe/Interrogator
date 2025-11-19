import { ReceivedData, WavelengthFields } from "../../../../shared";
import { ChartSerie } from "../types";


export const prepareWavelengthChartData = (
  data: ReceivedData[]
): ChartSerie[] => {
  const sensorSet = new Set<number>();

  data.forEach((item) => {
    Object.keys(item).forEach((key) => {
      const match = key.match(/^wavelength(\d+)$/);
      if (match) sensorSet.add(Number(match[1]));
    });
  });

  const sensorIds = Array.from(sensorSet).sort((a, b) => a - b);

  return sensorIds.map((id) => {
    return {
      id: `WL_${id}`,
      data: data.map((item) => ({
        x: item.time,
        y: item[`wavelength${id}` as keyof WavelengthFields] ?? 0,
      })),
    };
  });
};
