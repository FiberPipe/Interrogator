import { useEffect, useState } from "react";
import { ReceivedData, useInputStore } from "../../shared";

export function usePollingData(
    interval: number = 1000
) {
    const { filePaths } = useInputStore();
    const { sensorDataFilePath = '' } = filePaths ?? {};
    const [data, setData] = useState<ReceivedData[]>([]);

    useEffect(() => {
        const fetchInputs = async () => {
            try {
                const inputData = await window.electron.getSensorsData(sensorDataFilePath);
                inputData.shift();
                setData(inputData);
            } catch (err) {
                console.error("Error fetching input data:", err);
            }
        };

        fetchInputs();
        const intervalId = setInterval(fetchInputs, interval);

        return () => {
            clearInterval(intervalId);
        };
    }, [sensorDataFilePath, interval]);

    return { data };
}
