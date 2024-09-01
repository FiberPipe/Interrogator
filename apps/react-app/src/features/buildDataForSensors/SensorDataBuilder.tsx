import { FBGDataTable, WLDataTable } from "../../entities";
import { Tab, Tabs } from "@nextui-org/react";
import { useEffect, useState } from "react";
import {convertDataToJSON, useInputStore} from "../../shared";

export const SensorDataBuilder = () => {
  const [transformedData, setTransformedData] = useState<any>([]);
  const {filePaths} = useInputStore();
  const {sensorDataFilePath = ''} = filePaths ?? {};

  useEffect(() => {
    const fetchInputs = async () => {
      try {
        const inputData = await window.electron.getSensorsData(sensorDataFilePath);
        setTransformedData(convertDataToJSON(inputData as any));
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
    <>
      <Tabs aria-label="type">
        <Tab key="Wabelength" title="Wavelength">
          <WLDataTable body={transformedData} />
        </Tab>
        <Tab key="FBG" title="FBG">
          <FBGDataTable body={transformedData} />
        </Tab>
      </Tabs>
    </>
  );
};
