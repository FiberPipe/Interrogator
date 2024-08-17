import { useEffect, useState } from "react";
import { LineGraphWithCheckbox } from "../../entities";
import { transformData } from "./utils";

export const LineGraphDataBuilder: React.FC = () => {
  const [transformedData, setTransformedData] = useState<any>([]);


  useEffect(() => {
    const fetchInputs = async () => {
      try {
        const inputData = await window.electron.getSensorsData();
        const transData = transformData(inputData as any);
        setTransformedData(transData)


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



  return <LineGraphWithCheckbox names={transformedData.uniqueIds} data={transformedData.resultData} />;
};
