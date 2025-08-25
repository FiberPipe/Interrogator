import { useEffect, useState, useMemo } from "react";
import { SensorData } from "@app/electron/types";
import { ChartType } from "@shared/types/charts";

interface UseGetSensorChartDataProps {
    type: ChartType;
    sensorDataFilePath: string;
}

const fetchInputs = async (sensorDataFilePath: string) => {
    try {
        const sensorsData = await window.electron.getSensorsData(sensorDataFilePath);
        return sensorsData;
    } catch (error) {
        console.error("Error fetching input data:", error);
    }
    return [];
};

export const useGetSensorChartData = ({
    type,
    sensorDataFilePath,
}: UseGetSensorChartDataProps) => {
    const [rawData, setRawData] = useState<SensorData[]>([]);

    useEffect(() => {
        const intervalId = setInterval(async () => {
            const result = await fetchInputs(sensorDataFilePath).catch(() => []);
            setRawData(result);
        }, 1000);

        return () => {
            clearInterval(intervalId);
        };
    }, [sensorDataFilePath]);

    const maxChannels = useMemo(() => {
        if (rawData.length === 0) return 0;
        return Math.max(...rawData.map((d) => d.P.length));
    }, [rawData]);

    const chartData = useMemo(() => {
        if (type !== "power" || rawData.length === 0) return [];

        const grouped: Record<string, { id: string; data: { x: string; y: number }[] }> = {};

        rawData.forEach((record) => {
            for (let ch = 0; ch < record.P.length; ch++) {
                const id = `Ch-${ch}`;
                if (!grouped[id]) grouped[id] = { id, data: [] };

                grouped[id].data.push({
                    x: record.systemTime,
                    y: record.P[ch],
                });
            }
        });

        return Object.values(grouped);
    }, [rawData, type]);

    return { data: rawData, chartData, maxChannels };
};
