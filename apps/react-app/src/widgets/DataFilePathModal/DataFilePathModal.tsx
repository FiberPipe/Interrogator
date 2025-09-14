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
		Array.from({ length: 16 }, (_, i) => filePaths?.[`field${i + 1}`] || "")
	);

	const [wavelengthValues, setWavelengthValues] = useState<string[]>(
		Array.from({ length: 16 }, (_, i) => filePaths?.[`wavelength${i + 1}`] || "")
	);

	useEffect(() => {
		const loadSavedPaths = async () => {
			const savedPaths = await window.electron.getFilePaths();

			if (savedPaths.sensorDataFilePath) {
				setSensorDataFilePath(savedPaths.sensorDataFilePath);
			}

			setFieldValues((prev) =>
				prev.map((_, i) => savedPaths[`field${i + 1}`] || "")
			);

			setWavelengthValues((prev) =>
				prev.map((_, i) => savedPaths[`wavelength${i + 1}`] || "")
			);

			setFilePaths(savedPaths);
		};

		loadSavedPaths();
	}, [setFilePaths]);

	const onSubmit = async () => {
		const updatedPaths: Record<string, string> = {};

		if (sensorDataFilePath) updatedPaths.sensorDataFilePath = sensorDataFilePath;

		fieldValues.forEach((val, i) => {
			if (val) updatedPaths[`field${i + 1}`] = val;
		});

		wavelengthValues.forEach((val, i) => {
			if (val) updatedPaths[`wavelength${i + 1}`] = val;
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

			<div className="w-full flex justify-end">
				<Button
					isDisabled={!sensorDataFilePath}
					color="primary"
					onClick={onSubmit}
				>
					Сохранить
				</Button>
			</div>
		</div>
	);
};
