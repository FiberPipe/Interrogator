import { FBGDataTable, WLDataTable } from "../../entities";
import { Tab, Tabs } from "@nextui-org/react";
import { useEffect, useState } from "react";

export const SensorDataBuilder = () => {
  const [transformedData, setTransformedData] = useState<any>([]);
  useEffect(() => {
    const fetchInputs = async () => {
      try {
        const inputData = await window.electron.getSensorsData();
        setTransformedData(inputData)
      } catch (error) {
        console.error("Error fetching input data:", error);
      }
    };

    fetchInputs();

    const intervalId = setInterval(fetchInputs, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

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
