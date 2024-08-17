import React, { useEffect, useState } from "react";
import { BarGraph } from "../../shared/ui/BarGraph";
import { TBarGraphTransformedData, TData } from "../../shared";

export const BarGraphBuilder: React.FC = () => {

  const [transformedData, setTransformedData] = useState<any>([])

  useEffect(() => {
    const fetchInputs = async () => {
      try {
        const inputData = await window.electron.getSensorsData();
        const modifiedData = (inputData as any).map((d: TData): TBarGraphTransformedData => {
          return { name: d.id, value: d.potPin1 / d.potPin2 };
        });
      
        setTransformedData(modifiedData)


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

  return <BarGraph data={transformedData} />;
};
