import React, { useEffect, useState } from "react";
import { BarGraph } from "../../shared/ui/BarGraph";
import { TBarGraphTransformedData, TData, useInputStore } from "../../shared";

export const BarGraphBuilder: React.FC = () => {
  const [transformedData, setTransformedData] = useState<
    TBarGraphTransformedData[]
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

        // Преобразуем данные для BarGraph
        const modifiedData = Object.entries(dataBySensor).map(
          ([sensorId, entries]) => {
            const result: TBarGraphTransformedData = {
              name: `Sensor ${sensorId}`,
            };

            // Вычисляем PX и PX+1 для текущего sensor_id
            const x = 2 * Number(sensorId) - 1; // PX
            const pxKey = `P${x}`; // Ключ для PX (например, P1, P3, P5)
            const pxPlus1Key = `P${x + 1}`; // Ключ для PX+1 (например, P2, P4, P6)

            // Берем последнюю запись для текущего sensor_id
            const lastEntry = entries[entries.length - 1];
            if (
              lastEntry[pxKey] !== undefined &&
              lastEntry[pxPlus1Key] !== undefined
            ) {
              result.value = lastEntry[pxPlus1Key] / lastEntry[pxKey]; // Сохраняем отношение PX+1 / PX
            }

            return result;
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

  console.log(2727272, transformedData);
  return <BarGraph data={transformedData} />;
};
