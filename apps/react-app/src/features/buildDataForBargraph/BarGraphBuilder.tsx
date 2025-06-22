import React, { useEffect, useState } from "react";
import { BarGraph } from "../../shared/ui/BarGraph";
import { TBarGraphTransformedData, TData, useInputStore } from "../../shared";

export const BarGraphBuilder: React.FC = () => {
  const [transformedData, setTransformedData] = useState<
    TBarGraphTransformedData[][]
  >([]);
  const [uniqueIds, setUniqueIds] = useState<number[]>([]); // Уникальные sensor_id
  const { filePaths } = useInputStore();
  const { sensorDataFilePath = "" } = filePaths ?? {};

  useEffect(() => {
    const fetchInputs = async () => {
      try {
        const inputData = await window.electron.getSensorsData(
          sensorDataFilePath
        );

        console.log("fetchedData", inputData);

        // Группируем данные по sensor_id
        const dataBySensor: { [key: number]: TData[] } = inputData.reduce(
          (acc, entry) => {
            if (!acc[entry.id_sensor]) {
              acc[entry.id_sensor] = [];
            }
            acc[entry.id_sensor].push(entry);
            return acc;
          },
          {}
        );

        // Уникальные sensor_id
        const sensorIds = Object.keys(dataBySensor).map(Number);

        setUniqueIds(sensorIds);

        console.log("data", dataBySensor);
        // Преобразуем данные для BarGraph
        const modifiedData = Object.entries(dataBySensor).map(
          ([sensorId, entries]) => {
            let results2 = [];
            const result: TBarGraphTransformedData = {
              name: `Sensor ${sensorId}`,
            };

            let results = [];
            const lastEntry = entries[entries.length - 1];

            for (let i = 0; i < 8; i += 2) {
              if (
                lastEntry[`P${i}`] !== undefined &&
                lastEntry[`P${i + 1}`] !== undefined
              ) {
                results2.push({
                  name: `Sensor ${sensorId} P${i}/P${i + 1}`,
                  value: lastEntry[`P${i + 1}`] / lastEntry[`P${i}`],
                });
              }
            }

            return results2;
          }
        );

        setTransformedData(modifiedData);
      } catch (error) {
        console.error("Error fetching input data:", error);
      }
    };

    fetchInputs();

    const intervalId = setInterval(fetchInputs, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [sensorDataFilePath]);

  return <BarGraph data={transformedData} />;
};
