import { Fragment, useEffect, useState } from "react";
import { useInputStore } from "../../shared";
import { processSensorData } from "./utils";
import { Button } from "@nextui-org/react";
import { LineGraphWithCheckbox } from "../../entities/LineGraphWithCheckbox/PowerLineGraphWithCheckbox";

export const LineGraphDataBuilder: React.FC = () => {
  const [transformedData, setTransformedData] = useState<any>({
    uniqueIds: [],
    resultData: [],
  });

  const { filePaths } = useInputStore();
  const { sensorDataFilePath = "" } = filePaths ?? {};

  const [fetching, setFetching] = useState<boolean>(true);

  useEffect(() => {
    const fetchInputs = async () => {
      try {
        const sensorsData = await window.electron.getSensorsData(
          sensorDataFilePath
        );

        const processedData = processSensorData(sensorsData);

        console.log(111111, processedData)

        setTransformedData(processedData);
      } catch (error) {
        console.error("Error fetching input data:", error);
      }
    };

    if (fetching) {
      fetchInputs();
    }

    const intervalId = setInterval(() => {
      if (fetching) {
        fetchInputs();
      }
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [sensorDataFilePath, fetching]);

  const toggleFetching = () => {
    setFetching((prev) => !prev);
  };

  return (
    <Fragment>
      <Button color="primary" onClick={toggleFetching}>
        {fetching ? "Stop" : "Start"}
      </Button>
      <LineGraphWithCheckbox
        names={transformedData.uniqueIds}
        data={transformedData.resultData}
      />
    </Fragment>
  );
};
