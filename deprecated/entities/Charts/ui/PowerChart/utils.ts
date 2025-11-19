import { ReceivedData, WavelengthFields } from "../../../../shared";
import { ChartSerie } from "../types";

export const preparePowerChartData = (
    data: ReceivedData[]
): ChartSerie[] => {
    const sensorSet = new Set<number>();

    data.forEach((item) => {
        Object.keys(item).forEach((key) => {
            const match = key.match(/^P(\d+)$/);
            if (match) sensorSet.add(Number(match[1]));
        });
    });

    const sensorIds = Array.from(sensorSet).sort((a, b) => a - b);

    return sensorIds.map((id) => {
        return {
            id: `P${id}`,
            data: data.map((item) => ({
                x: item.time,
                y: item[`P${id}` as keyof WavelengthFields] ?? 0,
            })),
        };
    });
};
