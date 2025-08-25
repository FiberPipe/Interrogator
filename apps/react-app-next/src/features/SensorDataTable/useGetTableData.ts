import { useEffect, useState, useMemo } from "react";
import { SensorData } from "@app/electron/types";
import { ChartType } from "@shared/types/charts";
import { useTemperatureCalculator } from "./useTemperatureCalculator";

interface UseGetSensorTableDataProps {
    type: ChartType;
    sensorDataFilePath: string;
}

const fetchInputs = async (sensorDataFilePath: string) => {
    try {
        const sensorsData = await window.electron.getSensorsData(sensorDataFilePath);
        return sensorsData as SensorData[];
    } catch (error) {
        console.error("Error fetching sensor data:", error);
        return [];
    }
};

export const useGetTableData = ({
    type,
    sensorDataFilePath,
}: UseGetSensorTableDataProps) => {
    const [rawData, setRawData] = useState<SensorData[]>([]);
    const { calculateTemperature } = useTemperatureCalculator();

    useEffect(() => {
        const intervalId = setInterval(async () => {
            const result = await fetchInputs(sensorDataFilePath).catch(() => []);
            setRawData(result);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [sensorDataFilePath]);

    const tableData = useMemo(() => {
        if (rawData.length === 0) return [];

        if (type === "wavelength") {
            const values = rawData
                .map((d) => d.wavelength)
                .filter((v): v is number => typeof v === "number");

            if (values.length === 0) return [];

            return [
                {
                    id: "WL_0",
                    rangeMin: Math.min(...values),
                    rangeMax: Math.max(...values),
                    current: values[values.length - 1],
                    alarmMin: "", // пока пустые поля
                    alarmMax: "",
                },
            ];
        }

        if (type === "power") {
            return rawData.flatMap((record, i) =>
                record.P.map((val, ch) => ({
                    id: `P_${i}_${ch}`,
                    channel: `Ch-${ch}`,
                    time: record.systemTime,
                    power: val,
                }))
            );
        }

        if (type === "temperature") {
            return rawData.map((record, i) => ({
                id: `Temp_${i}`,
                wavelength: record.wavelength,
                temperature: calculateTemperature(record.wavelength, String(i)),
            }));
        }

        return [];
    }, [rawData, type, calculateTemperature]);

    return { rawData, tableData };
};
