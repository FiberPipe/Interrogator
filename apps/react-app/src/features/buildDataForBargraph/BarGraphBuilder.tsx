import React, { useEffect, useState } from "react";
import { BarGraph } from "../../shared/ui/BarGraph";
import { TBarGraphTransformedData, TData, useInputStore } from "../../shared";

export const BarGraphBuilder: React.FC = () => {
  const [transformedData, setTransformedData] = useState<any>([]);
  const { filePaths } = useInputStore();
  const { sensorDataFilePath = "" } = filePaths ?? {};

  useEffect(() => {
    const fetchInputs = async () => {
      try {
        const inputData = await window.electron.getSensorsData(
          sensorDataFilePath
        );

        console.log("fetchedData", inputData);

        const lastEntriesBySensor: TData[] = Object.values(
          inputData.reduce((acc, entry) => {
            acc[entry.id_sensor] = entry; // Сохраняем последнюю запись для каждого уникального id_sensor
            return acc;
          }, {})
        ) ;

        const modifiedData = lastEntriesBySensor
          .map((d: TData): TBarGraphTransformedData => {
            console.log("counter", d.Pn / d.Pn_plus_1);
            return { name: d.id_sensor, value: d.Pn / d.Pn_plus_1 };
          });

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
