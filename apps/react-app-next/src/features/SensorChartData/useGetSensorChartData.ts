import { ChartInputData, ChartType } from "@shared/types/charts";
import { useEffect, useState } from "react";

interface UseGetSensorChartDataProps {
    type: ChartType;
    sensorDataFilePath: string;
}

const fetchInputs = async (sensorDataFilePath: string) => {
    try {
        const sensorsData = await window.electron.getSensorsData(sensorDataFilePath);
        console.log(1514, sensorsData);
        return sensorsData;
    } catch (error) {
        console.error("Error fetching input data:", error);
    }

    return [];
};

export const useGetSensorChartData = ({ type, sensorDataFilePath }: UseGetSensorChartDataProps) => {
    const [outputData, setOutputData] = useState<ChartInputData[]>([]);

    useEffect(() => {
        const intervalId = setInterval(async () => {
                const result = await fetchInputs(sensorDataFilePath).catch(() => []);
                setOutputData(result);

        }, 1000);

        return () => {
            clearInterval(intervalId);
        };
    }, [sensorDataFilePath]);


    return {data: outputData};
}