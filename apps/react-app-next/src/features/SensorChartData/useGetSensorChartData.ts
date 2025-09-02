// useGetSensorChartData.ts
import { useEffect, useState, useMemo } from "react";
import { SensorData } from "@app/electron/types";
import { ChartType } from "@shared/types/charts";

interface UseGetSensorChartDataProps {
    type: ChartType;
    sensorDataFilePath: string;
}

export type ChartSerie = { id: string; data: { x: string; y: number }[] };

const LAMBDA_0 = 1550.0;
const L_MM = 100.0;

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

// ===============================
// Отдельные вычисления по типам
// ===============================
const buildPowerData = (rawData: SensorData[], maxChannels: number): ChartSerie[] => {
    const grouped: Record<string, ChartSerie> = {};
    rawData.forEach((record) => {
        for (let ch = 0; ch < maxChannels; ch++) {
            const y = record.P?.[ch];
            if (typeof y !== "number") continue;

            const id = `Ch-${ch}`;
            if (!grouped[id]) grouped[id] = { id, data: [] };
            grouped[id].data.push({ x: record.systemTime, y });
        }
    });
    return Object.values(grouped);
};

const buildWavelengthData = (rawData: SensorData[]): ChartSerie[] => {
    const id = "Ch-0";
    const serie: ChartSerie = { id, data: [] };
    rawData.forEach((record) => {
        if (typeof record.wavelength !== "number") return;
        serie.data.push({ x: record.systemTime, y: record.wavelength });
    });
    return serie.data.length > 0 ? [serie] : [];
};

const buildDisplacementData = (rawData: SensorData[]): ChartSerie[] => {
    const id = "Displacement";
    const serie: ChartSerie = { id, data: [] };
    rawData.forEach((record) => {
        if (typeof record.wavelength !== "number") return;
        serie.data.push({
            x: record.systemTime,
            y: calculateDisplacement(record.wavelength),
        });
    });
    return serie.data.length > 0 ? [serie] : [];
};

const buildAcquisitionData = (rawData: SensorData[]): ChartSerie[] => {
    const lastRecord = rawData[rawData.length - 1];
    if (!lastRecord?.P) return [];

    const grouped: Record<string, ChartSerie> = {};
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
    return Object.values(grouped);
};

// ===============================
// Хук
// ===============================
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

    const chartData: ChartSerie[] = useMemo(() => {
        if (rawData.length === 0 || maxChannels === 0) return [];

        switch (type) {
            case "power":
                return buildPowerData(rawData, maxChannels);
            case "wavelength":
                return buildWavelengthData(rawData);
            case "displacement":
                return buildDisplacementData(rawData);
            case "acqusition":
                return buildAcquisitionData(rawData);
            default:
                return [];
        }
    }, [rawData, type, maxChannels]);

    return { data: rawData, chartData, maxChannels };
};
