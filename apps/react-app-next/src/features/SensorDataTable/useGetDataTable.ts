import { SensorData } from "@app/electron/types";
import { useInputStore } from "@shared/store";
import { ChartType } from "@shared/types/charts";
import { useState, useEffect, useMemo } from "react";

const fetchData = async (sensorDataFilePath: string) => {
  try {
    const sensorsData = await window.electron.getSensorsData(sensorDataFilePath);
    return sensorsData as SensorData[];
  } catch (error) {
    console.error("Error fetching input data:", error);
    return [];
  }
};

export const useGetDataTable = (type: ChartType) => {
  const { filePaths, updateInputValue, initializeInputValues, inputValues } = useInputStore();
  const { sensorDataFilePath = "" } = filePaths ?? {};
  const [rawData, setRawData] = useState<SensorData[]>([]);

  // Загружаем данные сенсоров каждые 1 сек
  useEffect(() => {
    const intervalId = setInterval(async () => {
      const result = await fetchData(sensorDataFilePath).catch(() => []);
      setRawData(result);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [sensorDataFilePath]);

  // Инициализация инпутов из файла
  useEffect(() => {
    const fetchInputs = async () => {
      try {
        const inputData = await window.electron.getInputs();
        initializeInputValues(inputData ?? {});
      } catch (error) {
        console.error("Error fetching input data:", error);
      }
    };
    fetchInputs();
  }, [initializeInputValues]);

  const handleInputChange = async (key: string, value: string) => {
    await window.electron.insertInput(key, value).catch((err) => {
      console.error("❌ insertInput error:", err);
    });
    updateInputValue(key, value);
  };

  const inputs = useMemo(() => {
    if (!inputValues) return {};

    switch (type) {
      case "fbg":
        return Object.fromEntries(
          Object.entries(inputValues).filter(([key]) => key.startsWith("FBG_"))
        );
      default:
        return inputValues;
    }
  }, [inputValues, type]);

  return { tableData: rawData, handleInputChange, inputs };
};
