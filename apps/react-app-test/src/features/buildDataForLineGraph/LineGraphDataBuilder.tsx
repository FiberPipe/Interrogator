import { Fragment, useEffect, useRef, useState } from "react";
import { LineGraphWithCheckbox } from "../../entities";
import { useInputStore } from "../../shared";
import { processSensorData } from "./utils";
import { Button } from "@nextui-org/react";

export const LineGraphDataBuilder: React.FC = () => {
  const [transformedData, setTransformedData] = useState({
    uniqueIds: [] as string[],
    resultData: [] as any[],
  });
  const [inputData, setInputData] = useState<Record<string, string>>({});
  const { filePaths } = useInputStore();
  const sensorDataFilePath = filePaths?.sensorDataFilePath || "";

  const [fetching, setFetching] = useState(true);
  const [version, setVersion] = useState(0);

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    if (!sensorDataFilePath) return;

    const fetchOnce = async () => {
      try {
        const sensorsData = await (window as any).electron.getSensorsData(sensorDataFilePath);
        const inputDataResp = await (window as any).electron.getInputs();

        const processed = processSensorData((sensorsData || []).filter((row: any) => row != null));
        if (!mounted.current) return;

        setInputData(inputDataResp || {});
        setTransformedData(processed);
      } catch (e) {
        console.error("Error fetching input data:", e);
      }
    };

    if (fetching) fetchOnce();
    const id = setInterval(() => { if (fetching) fetchOnce(); }, 1000);
    return () => clearInterval(id);
  }, [sensorDataFilePath, fetching]);

  // реагируем на очистку файла из main-процесса
  useEffect(() => {
    const handler = (_: any, clearedPath: string) => {
      // если очищали текущий файл — чистим стейты и перемонтируем график
      if (!sensorDataFilePath || clearedPath === sensorDataFilePath) {
        setTransformedData({ uniqueIds: [], resultData: [] });
        setInputData({});
        setVersion((v) => v + 1);    // ключ графика меняется => он монтируется заново
        setFetching(true);           // оставляем опрос включённым
      }
    };
    const wrapped = (window as any).electron.subscribe("data-file-cleared", handler);
    return () => (window as any).electron.unsubscribe("data-file-cleared", wrapped);
  }, [sensorDataFilePath]);

  const toggleFetching = () => setFetching((prev) => !prev);

  return (
    <Fragment>
      <div className="mb-2">
        <Button color="primary" onClick={toggleFetching}>
          {fetching ? "Stop" : "Start"}
        </Button>
      </div>
      {/* key={version} гарантирует сброс brush/оси/внутреннего стейта графика */}
      <LineGraphWithCheckbox
        key={version}
        names={transformedData.uniqueIds}
        data={transformedData.resultData}
        sensorsConstraints={inputData}
      />
    </Fragment>
  );
};
