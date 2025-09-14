import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Input,
  Checkbox,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { useInputStore } from "../../shared";

const SENSOR_TYPES = [
  { label: "Displacement", value: "displacement" },
  { label: "Temperature", value: "temperature" },
  { label: "None", value: "" },
];

export const SensorPortMapping: React.FC = () => {
  const { filePaths, setFilePaths } = useInputStore();

  const [sensorCount, setSensorCount] = useState<number>(
    filePaths?.sensorCount || 0
  );
  const [sensorPorts, setSensorPorts] = useState<Record<number, string[]>>(
    filePaths?.sensorPorts || {}
  );
  const [sensorTypes, setSensorTypes] = useState<Record<number, string>>(
    filePaths?.sensorTypes || {}
  );

  const ports = Array.from({ length: 16 }, (_, i) => `P${i}`);

  // загрузка сохранённых значений
  useEffect(() => {
    const loadSaved = async () => {
      const savedInputs = await window.electron.getInputs();
      if (savedInputs.sensorCount) {
        setSensorCount(savedInputs.sensorCount);
      }
      if (savedInputs.sensorPorts) {
        setSensorPorts(savedInputs.sensorPorts);
      }
      if (savedInputs.sensorTypes) {
        setSensorTypes(savedInputs.sensorTypes);
      }
      setFilePaths(savedInputs);
    };
    loadSaved();
  }, [setFilePaths]);

  // обновление inputs.json
  const saveInput = async (key: string, value: any) => {
    await window.electron.insertInput(key, value);
    setFilePaths({ ...filePaths, [key]: value });
  };

  const togglePort = (sensorIndex: number, port: string) => {
    const current = sensorPorts[sensorIndex] || [];
    let updated: string[];

    if (current.includes(port)) {
      updated = current.filter((p) => p !== port);
      const newSensorPorts = { ...sensorPorts, [sensorIndex]: updated };
      setSensorPorts(newSensorPorts);
      saveInput("sensorPorts", newSensorPorts);
    } else {
      updated = [...current, port];
      const newSensorPorts: Record<number, string[]> = {};
      for (let i = 0; i < sensorCount; i++) {
        if (i === sensorIndex) {
          newSensorPorts[i] = updated;
        } else {
          newSensorPorts[i] = (sensorPorts[i] || []).filter((p) => p !== port);
        }
      }
      setSensorPorts(newSensorPorts);
      saveInput("sensorPorts", newSensorPorts);
    }
  };

  const handleTypeChange = (sensorIndex: number, value: string) => {
    const newTypes = { ...sensorTypes, [sensorIndex]: value };
    setSensorTypes(newTypes);
    saveInput("sensorTypes", newTypes);
  };

  const usedPorts = Object.values(sensorPorts).flat();

  return (
    <div className="flex flex-col gap-6">
      {/* Количество датчиков */}
      <Card className="max-w-[400px]">
        <CardHeader>Количество датчиков</CardHeader>
        <Divider />
        <CardBody>
          <Input
            type="number"
            min={1}
            max={8}
            value={sensorCount ? String(sensorCount) : ""}
            placeholder="Введите количество (1-8)"
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (val >= 1 && val <= 8) {
                setSensorCount(val);
                saveInput("sensorCount", val);
              } else {
                setSensorCount(0);
                saveInput("sensorCount", 0);
              }
            }}
          />
        </CardBody>
      </Card>

      {/* Привязка портов + выбор типа */}
      {sensorCount > 0 && (
        <Card className="w-full">
          <CardHeader>Настройка датчиков</CardHeader>
          <Divider />
          <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: sensorCount }, (_, idx) => (
              <div key={idx} className="flex flex-col gap-3 p-3 border rounded-lg">
                <p className="font-medium">Датчик {idx}</p>

                {/* Тип датчика */}
                <Select
                  selectedKeys={
                    sensorTypes[idx] ? new Set([sensorTypes[idx]]) : new Set()
                  }
                  onSelectionChange={(keys) => {
                    const val = Array.from(keys as Set<string>)[0] || "";
                    handleTypeChange(idx, val);
                  }}
                >
                  {SENSOR_TYPES.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </Select>

                {/* Порты */}
                <div className="grid grid-cols-4 gap-2">
                  {ports.map((p) => {
                    const isUsed = usedPorts.includes(p);
                    const isSelected = sensorPorts[idx]?.includes(p);
                    return (
                      <Checkbox
                        key={p}
                        isSelected={isSelected}
                        isDisabled={isUsed && !isSelected}
                        onChange={() => togglePort(idx, p)}
                      >
                        {p}
                      </Checkbox>
                    );
                  })}
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      {/* Кнопка сохранения */}
      <Button
        isDisabled={!sensorCount}
        color="primary"
        onClick={() => {
          saveInput("sensorPorts", sensorPorts);
          saveInput("sensorCount", sensorCount);
          saveInput("sensorTypes", sensorTypes);
        }}
      >
        Сохранить
      </Button>
    </div>
  );
};
