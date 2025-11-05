import React, { useEffect, useState } from "react";
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Divider,
	Input,
} from "@nextui-org/react";
import { useInputStore } from "../../shared";
import { SensorPortMapping } from "./SensorDataMapping";
import { NormalizationFields } from "./NormalizationFields";
import { WavelengthFields } from "./WavelengthFields";

export const DataFilePathModal: React.FC = () => {
	const { filePaths, setFilePaths } = useInputStore();

	const [sensorDataFilePath, setSensorDataFilePath] = useState<string>(
		filePaths?.sensorDataFilePath || ""
	);

	const [fieldValues, setFieldValues] = useState<string[]>(
		Array.from({ length: 16 }, (_, i) => filePaths?.[`field${i}`] || "")
	);

	const [wavelengthValues, setWavelengthValues] = useState<string[]>(
		Array.from({ length: 16 }, (_, i) => filePaths?.[`lambdas_central${i}`] || "")
	);


  const onClearJson = async () => {
    const ok = await window.electron.clearJson(sensorDataFilePath);
    if (!ok) {
      console.warn("clearJson failed");
    }
  };

	useEffect(() => {
		const loadSavedPaths = async () => {
			const savedPaths = await window.electron.getFilePaths();

			if (savedPaths.sensorDataFilePath) {
				setSensorDataFilePath(savedPaths.sensorDataFilePath);
			}

			setFieldValues((prev) =>
				prev.map((_, i) => savedPaths[`field${i}`] || "")
			);

			setWavelengthValues((prev) =>
				prev.map((_, i) => savedPaths[`lambdas_central${i}`] || "")
			);

			setFilePaths(savedPaths);
		};

		loadSavedPaths();
	}, [setFilePaths]);

	const onSubmit = async () => {
		const updatedPaths: Record<string, string> = {};

		if (sensorDataFilePath) updatedPaths.sensorDataFilePath = sensorDataFilePath;

		fieldValues.forEach((val, i) => {
			if (val) updatedPaths[`field${i}`] = val;
		});

		wavelengthValues.forEach((val, i) => {
			if (val) updatedPaths[`lambdas_central${i}`] = val;
		});

		if (Object.keys(updatedPaths).length > 0) {
			setFilePaths(updatedPaths);
			await window.electron.setFilePaths(updatedPaths);

			// 👉 сразу вызываем сборщик, если есть путь к файлу
			if (updatedPaths.sensorDataFilePath) {
				console.log("Запускаем сбор данных:", updatedPaths.sensorDataFilePath);
				window.electron.startSensorCollector(updatedPaths.sensorDataFilePath);
			}
		}
	};

	const selectSensorsDataFilePath = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		const path = await window.electron.selectFile();
		if (path) {
			setSensorDataFilePath(path);
		}
	};

	// 🧹 Очистка выбранного файла
	const clearFilePath = async () => {
		setSensorDataFilePath("");
		const updatedPaths = { ...filePaths, sensorDataFilePath: "" };
		setFilePaths(updatedPaths);
		await window.electron.setFilePaths(updatedPaths);
		console.log("🧹 Путь к файлу очищен");
	};

	return (
		<div className="gap-6">
			<Card className="w-[400px]">
				<CardHeader>Укажите путь до файла c данными сенсоров</CardHeader>
				<Divider />
				<CardBody onClick={selectSensorsDataFilePath}>
					<Input
						placeholder="Sensors Data File Path"
						value={sensorDataFilePath}
						readOnly
					/>
				</CardBody>
			</Card>

			<SensorPortMapping />

			<div className="flex flex-row flex-wrap gap-6">
				<NormalizationFields values={fieldValues} onChange={setFieldValues} />
				<WavelengthFields
					values={wavelengthValues}
					onChange={setWavelengthValues}
				/>
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
