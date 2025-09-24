import React, { useEffect, useState } from "react";
import { Button, Card, CardBody, CardHeader, Divider, Input } from "@nextui-org/react";
import { useInputStore } from "../../shared";
import { SensorPortMapping } from "./SensorDataMapping";
import { NormalizationFields } from "./NormalizationFields";
import { WavelengthFields } from "./WavelengthFields";

export const DataFilePathModal: React.FC = () => {
  const { filePaths, setFilePaths } = useInputStore();

  const [sensorDataFilePath, setSensorDataFilePath] = useState<string>(filePaths?.sensorDataFilePath || "");

  // динамические поля — берём аккуратно через any, чтобы TS не ругался на индексацию
  const [fieldValues, setFieldValues] = useState<string[]>(
    Array.from({ length: 16 }, (_, i) => ((filePaths as any)?.[`field${i}`] as string) || "")
  );
  const [wavelengthValues, setWavelengthValues] = useState<string[]>(
    Array.from({ length: 16 }, (_, i) => ((filePaths as any)?.[`lambdas_central${i}`] as string) || "")
  );

  useEffect(() => {
    const loadSavedPaths = async () => {
      const savedPaths = await window.electron.getFilePaths();

      if (savedPaths.sensorDataFilePath) {
        setSensorDataFilePath(savedPaths.sensorDataFilePath);
      }

      setFieldValues((prev) => prev.map((_, i) => ((savedPaths as any)[`field${i}`] as string) || ""));
      setWavelengthValues((prev) => prev.map((_, i) => ((savedPaths as any)[`lambdas_central${i}`] as string) || ""));

      // локальный стор, чтобы остальной UI мгновенно узнал о путях
      setFilePaths(savedPaths);
    };

    loadSavedPaths();

    // слушаем «мгновенные» апдейты из main
    const unsub1 = window.electron.subscribe("file-paths-updated", (_: any, updated: any) => {
      if (updated?.sensorDataFilePath) setSensorDataFilePath(updated.sensorDataFilePath);
      setFilePaths(updated || {});
    });

    return () => {
      window.electron.unsubscribe("file-paths-updated", unsub1);
    };
  }, [setFilePaths]);

  const onSubmit = async () => {
    const updatedPaths: Record<string, string> = {};

    if (sensorDataFilePath) updatedPaths.sensorDataFilePath = sensorDataFilePath;

    fieldValues.forEach((val, i) => { if (val) updatedPaths[`field${i}`] = val; });
    wavelengthValues.forEach((val, i) => { if (val) updatedPaths[`lambdas_central${i}`] = val; });

    if (Object.keys(updatedPaths).length > 0) {
      // мгновенно меняем локальный стор
      setFilePaths({ ...(filePaths || {}), ...updatedPaths });

      // отправляем в main — он сам разошлёт событие по всем окнам
      const saved = await window.electron.setFilePaths(updatedPaths);

      // дополнительная синхронизация (на случай, если main что-то дополнил)
      if (saved) setFilePaths(saved);
    }
  };

  const onClearJson = async () => {
    const ok = await window.electron.clearJson(sensorDataFilePath);
    if (!ok) {
      // можно показать тост, но не навязываю UI
      console.warn("clearJson failed");
    }
  };

  const selectSensorsDataFilePath = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const picked = await window.electron.selectFile();
    if (picked) setSensorDataFilePath(picked);
  };

  return (
    <div className="gap-6">
      <Card className="w-[420px]">
        <CardHeader>Укажите путь до файла c данными сенсоров</CardHeader>
        <Divider />
        <CardBody onClick={selectSensorsDataFilePath}>
          <Input placeholder="Sensors Data File Path" value={sensorDataFilePath} readOnly />
        </CardBody>
      </Card>

      <SensorPortMapping />

      <div className="flex flex-row flex-wrap gap-6">
        <NormalizationFields values={fieldValues} onChange={setFieldValues} />
        <WavelengthFields values={wavelengthValues} onChange={setWavelengthValues} />
      </div>

      <div className="w-full flex justify-end gap-3">
        <Button
          variant="flat"
          color="danger"
          isDisabled={!sensorDataFilePath}
          onClick={onClearJson}
        >
          Очистить JSON
        </Button>

        <Button
          color="primary"
          isDisabled={!sensorDataFilePath}
          onClick={onSubmit}
        >
          Сохранить
        </Button>
      </div>
    </div>
  );
};
