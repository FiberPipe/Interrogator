import { useEffect, useState } from "react";
import { LineGraphWithCheckbox } from "../../entities";
import { useInputStore } from "../../shared";
import { processSensorData } from "./utils";

export const LineGraphDataBuilder: React.FC = () => {
  const [transformedData, setTransformedData] = useState<any>({
    uniqueIds: [],
    resultData: [],
  });
  const [inputData, setInputData] = useState<{[key: string]: string}>({});
  const { filePaths } = useInputStore();
  const { sensorDataFilePath = "" } = filePaths ?? {};

  useEffect(() => {
    const fetchInputs = async () => {
      try {
        const sensorsData = await window.electron.getSensorsData(sensorDataFilePath);
        const inputData = await window.electron.getInputs();

        const processedData = processSensorData(sensorsData.filter((row) => row !== null));

        setInputData(inputData)
        setTransformedData(processedData);
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

  return (
    <LineGraphWithCheckbox
      names={transformedData.uniqueIds}
      data={transformedData.resultData}
      sensorsConstraints={inputData}
    />
  );
};
