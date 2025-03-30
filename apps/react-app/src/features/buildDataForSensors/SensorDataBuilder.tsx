import { FBGDataTable, WLDataTable } from "../../entities";
import { Tab, Tabs } from "@nextui-org/react";
import { useEffect, useState } from "react";
import {TData, useInputStore} from "../../shared";
import { TemperatureTable } from "../../entities/TemperatureTable";
import { DisplacementTable } from "../../entities/DisplacementTable";

export const SensorDataBuilder = () => {
  const [transformedData, setTransformedData] = useState<TData[]>([]);
  const {filePaths} = useInputStore();
  const {sensorDataFilePath = ''} = filePaths ?? {};

  useEffect(() => {
    const fetchInputs = async () => {
      try {
        const inputData = await window.electron.getSensorsData(sensorDataFilePath);
        setTransformedData(inputData);
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
        <Tab key="Temperature" title="Temperature">
          <TemperatureTable body={transformedData} />
        </Tab>
        <Tab key="Displacement" title="Displacement">
          <DisplacementTable body={transformedData} />
        </Tab>
      </Tabs>
    </>
  );
};
