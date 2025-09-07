import React, { useEffect } from 'react';
import { Button, Card, CardBody, CardFooter, CardHeader, Divider, Input } from "@nextui-org/react";
import { useInputStore } from "../../shared";

export const DataFilePathModal: React.FC = () => {
	const { filePaths, setFilePaths } = useInputStore();

	const [sensorDataFilePath, setSensorDataFilePath] = React.useState<string>(filePaths?.sensorDataFilePath || '');

	// загрузка сохранённых путей
	useEffect(() => {
		const loadSavedPaths = async () => {
			const savedPaths = await window.electron.getFilePaths();
			if (savedPaths.sensorDataFilePath) {
				setSensorDataFilePath(savedPaths.sensorDataFilePath);
			}
			setFilePaths(savedPaths);
		};
		loadSavedPaths();
	}, [setFilePaths]);

	// ---- сохранение путей ----
	const onSubmitSensorFile = async () => {
		if (sensorDataFilePath) {
			setFilePaths({ sensorDataFilePath });
			await window.electron.setFilePaths({ sensorDataFilePath });
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
		<div className="flex flex-col gap-6">
			{/* Карточка выбора файла с данными */}
			<Card className="max-w-[400px]">
				<CardHeader>Укажите путь до файла c данными сенсоров</CardHeader>
				<Divider />
				<CardBody onClick={selectSensorsDataFilePath}>
					<Input placeholder="Sensors Data File Path" value={sensorDataFilePath} />
				</CardBody>
				<Divider />
				<CardFooter>
					<Button
						isDisabled={!sensorDataFilePath}
						color="primary"
						onClick={onSubmitSensorFile}
					>
						Сохранить
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
};
