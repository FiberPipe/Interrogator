import React, { useEffect } from 'react';
import { Button, Card, CardBody, CardFooter, CardHeader, Divider, Input } from "@nextui-org/react";
import { useInputStore } from "../../shared";

export const DataFilePathModal: React.FC = () => {
	const { filePaths, setFilePaths } = useInputStore()

	const [sensorDataFilePath, setSensorDataFilePath] = React.useState<string>(filePaths?.sensorDataFilePath || '');

	useEffect(() => {
		const loadSavedPaths = async () => {
			const savedPaths = await window.electron.getFilePaths();
			if (savedPaths.sensorDataFilePath) {
				setSensorDataFilePath(savedPaths.sensorDataFilePath);
				setFilePaths({ sensorDataFilePath: savedPaths.sensorDataFilePath });
			}
		};

		loadSavedPaths();
	}, [setFilePaths]);

	const submitButtonDisabled = !Boolean(sensorDataFilePath);

	const onSubmit = async () => {
		if (sensorDataFilePath) {
			setFilePaths({ sensorDataFilePath });
			await window.electron.setFilePaths({ sensorDataFilePath });
		}
	}

	const selectSensorsDataFilePath = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		const path = await window.electron.selectFile();
		if (path) {
			setSensorDataFilePath(path);
		}
	}

	return (
		<div>
			<Card className="max-w-[400px]">
				<CardHeader>Укажите путь до файла c данными сенсоров</CardHeader>
				<Divider />
				<CardBody onClick={selectSensorsDataFilePath}>
					<Input placeholder={"Sensors Data File Path"} value={sensorDataFilePath} />
				</CardBody>
				<Divider />
				<CardFooter>
					<Button isDisabled={submitButtonDisabled} color={'primary'} onClick={onSubmit}>Submit</Button>
				</CardFooter>
			</Card>
		</div>
	);
};
