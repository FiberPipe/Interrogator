import React from "react";
import { LineGraphDataBuilder } from "../../features";
import { useInputStore } from "../../shared";
import { processSensorData } from "../../features/buildDataForLineGraph/utils";
import { Card, CardBody, RadioGroup, Radio } from "@nextui-org/react";

type Method = "Analytical" | "ML";

/** Безопасные обёртки над IPC — чтобы не падать, если хендлер ещё не зарегистрирован. */
const ipc = (() => {
  const api = (window as any)?.electron || {};
  return {
    getSensorsData: api.getSensorsData?.bind(api) as
      | ((path: string) => Promise<any[]>)
      | undefined,
    getPredictionMethods: api.getPredictionMethods?.bind(api) as
      | (() => Promise<Record<string, Method>>)
      | undefined,
    setPredictionMethod: api.setPredictionMethod?.bind(api) as
      | ((idx: number, m: Method) => Promise<Record<string, Method>>)
      | undefined,
  };
})();

/** Компактная панель выбора метода для каждого сенсора. */
const MethodsToolbar: React.FC = () => {
  const { filePaths } = useInputStore();
  const filePath = filePaths?.sensorDataFilePath || "";

  const [ids, setIds] = React.useState<string[]>([]);
  const [methods, setMethods] = React.useState<Record<string, Method>>({});

  const loadIds = React.useCallback(async () => {
    if (!filePath || !ipc.getSensorsData) return;
    const rows = await ipc.getSensorsData(filePath);
    const processed = processSensorData((rows || []).filter((r: any) => r != null));
    setIds(processed.uniqueIds as string[]);
  }, [filePath]);

  const loadMethods = React.useCallback(async () => {
    if (!ipc.getPredictionMethods) return;
    const m = await ipc.getPredictionMethods();
    setMethods(m || {});
  }, []);

  React.useEffect(() => {
    loadIds();
    loadMethods();
    const id = setInterval(loadIds, 2000);
    return () => clearInterval(id);
  }, [loadIds, loadMethods]);

  const idxFromKey = (k: string) => Number(k.replace("wavelength", ""));

  const setMethod = async (sensorIndex: number, method: Method) => {
    setMethods((prev) => ({ ...prev, [String(sensorIndex)]: method })); // оптимистично
    if (!ipc.setPredictionMethod) return;
    try {
      const next = await ipc.setPredictionMethod(sensorIndex, method);
      if (next && typeof next === "object") setMethods(next);
    } catch (e) {
      console.error("setPredictionMethod failed:", e);
    }
  };

  if (!ids.length) return null;

  return (
    <Card className="w-full border border-default-200 rounded-large bg-content1/50">
      <CardBody className="py-2 px-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          {ids.map((k) => {
            const idx = idxFromKey(k);
            const value: Method = (methods[String(idx)] as Method) || "Analytical";
            return (
              <div key={k} className="flex items-center gap-2">
                <span className="text-sm text-default-600">{`Sensor ${idx}`}</span>
                <RadioGroup
                  orientation="horizontal"
                  size="sm"
                  className="gap-3"
                  value={value}
                  onValueChange={(v) => setMethod(idx, v as Method)}
                >
                  <Radio value="Analytical">Analytical</Radio>
                  <Radio value="ML">ML</Radio>
                </RadioGroup>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
};

export const ChartsPage: React.FC = () => {
  return (
    <div className="px-3 py-2 h-[calc(100vh-64px)] flex flex-col gap-2">
      <MethodsToolbar />
      {/* Контейнер графика — занимает почти всё окно.
          Класс chart-pane нужен, если скрываете точки через CSS. */}
      <div className="chart-pane flex-1 min-h-[360px] min-w-0">
        <LineGraphDataBuilder />
      </div>
    </div>
  );
};

export default ChartsPage;
