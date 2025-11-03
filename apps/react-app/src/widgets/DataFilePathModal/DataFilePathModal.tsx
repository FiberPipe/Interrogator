import React, { useEffect, useState } from "react";
import { Button, Card, CardBody, CardHeader, Divider, Input } from "@heroui/react";
import { useInputStore } from "../../shared";
import { SensorPortMapping } from "./SensorDataMapping";
import { NormalizationFields } from "./NormalizationFields";
import { WavelengthFields } from "./WavelengthFields";

export const DataFilePathModal: React.FC = () => {
  const { filePaths, setFilePaths } = useInputStore();

  const [sensorDataFilePath, setSensorDataFilePath] = useState<string>(filePaths?.sensorDataFilePath || "");
  const [fieldValues, setFieldValues] = useState<string[]>(
    Array.from({ length: 16 }, (_, i) => ((filePaths as any)?.[`field${i}`] as string) || "")
  );
  const [wavelengthValues, setWavelengthValues] = useState<string[]>(
    Array.from({ length: 16 }, (_, i) => ((filePaths as any)?.[`lambdas_central${i}`] as string) || "")
  );

  useEffect(() => {
    const loadSavedPaths = async () => {
      const savedPaths = await window.electron.getFilePaths();
      if (savedPaths.sensorDataFilePath) setSensorDataFilePath(savedPaths.sensorDataFilePath);

      setFieldValues((prev) => prev.map((_, i) => ((savedPaths as any)[`field${i}`] as string) || ""));
      setWavelengthValues((prev) => prev.map((_, i) => ((savedPaths as any)[`lambdas_central${i}`] as string) || ""));
      setFilePaths(savedPaths);
    };

    loadSavedPaths();

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
      setFilePaths({ ...(filePaths || {}), ...updatedPaths });
      const saved = await window.electron.setFilePaths(updatedPaths);
      if (saved) setFilePaths(saved);
    }
  };

  const onClearJson = async () => {
    const ok = await window.electron.clearJson(sensorDataFilePath);
    if (!ok) console.warn("clearJson failed");
  };

  const selectSensorsDataFilePath = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const picked = await window.electron.selectFile();
    if (picked) setSensorDataFilePath(picked);
  };

  return (
    <div className="flex flex-col gap-8 p-4 w-full max-w-5xl mx-auto">

      <Card>
        <CardHeader className="font-semibold text-lg">Путь к файлу данных сенсоров</CardHeader>
        <Divider />
        <CardBody onClick={selectSensorsDataFilePath}>
          <Input
            placeholder="Выберите файл с данными сенсоров"
            value={sensorDataFilePath}
            readOnly
            fullWidth
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="font-semibold text-lg">Настройка датчиков</CardHeader>
        <Divider />
        <CardBody>
          <SensorPortMapping />
        </CardBody>
      </Card>

      {/* === Группа 3: Калибровка и параметры === */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="font-semibold text-lg">Нормализация</CardHeader>
          <Divider />
          <CardBody>
            <NormalizationFields values={fieldValues} onChange={setFieldValues} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="font-semibold text-lg">Длины волн</CardHeader>
          <Divider />
          <CardBody>
            <WavelengthFields values={wavelengthValues} onChange={setWavelengthValues} />
          </CardBody>
        </Card>
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
