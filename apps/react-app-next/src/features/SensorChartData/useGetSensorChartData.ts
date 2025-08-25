import { useEffect, useState, useMemo } from "react";
import { SensorData } from "@app/electron/types";
import { ChartType } from "@shared/types/charts";

interface UseGetSensorChartDataProps {
    type: ChartType;
    sensorDataFilePath: string;
}

type ChartSerie = { id: string; data: { x: string; y: number }[] };

// Константы из Java
const LAMBDA_0 = 1550.0; // эталонная длина волны (нм)
const L_MM = 100.0;      // длина участка волокна (мм)

const calculateDisplacement = (measuredLambda: number): number => {
    if (measuredLambda <= 0) return 0;
    const deltaLambda = measuredLambda - LAMBDA_0;
    return (L_MM * deltaLambda) / LAMBDA_0;
};

const fetchInputs = async (sensorDataFilePath: string) => {
    try {
        const sensorsData = await window.electron.getSensorsData(sensorDataFilePath);
        return sensorsData as SensorData[];
    } catch (error) {
        console.error("Error fetching input data:", error);
        return [];
    }
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
        return () => clearInterval(intervalId);
    }, [sensorDataFilePath]);

    // Кол-во каналов для текущего типа
    const maxChannels = useMemo(() => {
        if (rawData.length === 0) return 0;

        if (type === "power" || type === "acqusition") {
            return Math.max(...rawData.map((d) => d.P?.length ?? 0));
        }

        if (type === "wavelength" || type === "displacement") {
            const hasAny = rawData.some((d) => typeof d.wavelength === "number");
            return hasAny ? 1 : 0;
        }

        return 0;
    }, [rawData, type]);

    // Унифицированные данные для чарта
    const chartData: ChartSerie[] = useMemo(() => {
        if (rawData.length === 0 || maxChannels === 0) return [];

        const grouped: Record<string, ChartSerie> = {};

        if (type === "power") {
            rawData.forEach((record) => {
                for (let ch = 0; ch < maxChannels; ch++) {
                    const y = record.P?.[ch];
                    if (typeof y !== "number") continue;

                    const id = `Ch-${ch}`;
                    if (!grouped[id]) grouped[id] = { id, data: [] };
                    grouped[id].data.push({ x: record.systemTime, y });
                }
            });
        }

        if (type === "wavelength") {
            rawData.forEach((record) => {
                const y = record.wavelength;
                if (typeof y !== "number") return;

                const id = "Ch-0";
                if (!grouped[id]) grouped[id] = { id, data: [] };
                grouped[id].data.push({ x: record.systemTime, y });
            });
        }

        if (type === "displacement") {
            rawData.forEach((record) => {
                const lambda = record.wavelength;
                if (typeof lambda !== "number") return;

                const displacement = calculateDisplacement(lambda);
                const id = "Displacement";
                if (!grouped[id]) grouped[id] = { id, data: [] };
                grouped[id].data.push({ x: record.systemTime, y: displacement });
            });
        }

        if (type === "acqusition") {
            const lastRecord = rawData[rawData.length - 1];
            if (lastRecord?.P) {
                for (let ch = 0; ch < lastRecord.P.length; ch += 2) {
                    const p1 = lastRecord.P[ch];
                    const p2 = lastRecord.P[ch + 1];
                    if (typeof p1 !== "number" || typeof p2 !== "number") continue;

                    const id = `Ratio-${ch}/${ch + 1}`;
                    grouped[id] = {
                        id,
                        data: [{ x: String(ch), y: p1 / p2 }],
                    };
                }
            }
        }

        return Object.values(grouped);
    }, [rawData, type, maxChannels]);

    return { data: rawData, chartData, maxChannels };
};
