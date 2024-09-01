import { useEffect, useState } from "react";
import { LineGraphWithCheckbox } from "../../entities";
import { convertDataToJSON, useInputStore } from "../../shared";
import { processSensorData } from "./utils";

export const LineGraphDataBuilder: React.FC = () => {
  const [transformedData, setTransformedData] = useState<any>({ uniqueIds: [], resultData: [] });
  const { filePaths } = useInputStore();
  const { sensorDataFilePath = '' } = filePaths ?? {};

  useEffect(() => {
    const fetchInputs = async () => {
      try {
        const inputData = await window.electron.getSensorsData(sensorDataFilePath);
        const parsedData = convertDataToJSON(inputData as any);
        const processedData = processSensorData(parsedData);

        setTransformedData(processedData)
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



  return <LineGraphWithCheckbox names={transformedData.uniqueIds} data={transformedData.resultData} />;
};
