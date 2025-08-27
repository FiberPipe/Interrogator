import React, { useEffect } from 'react';
import { Button, Card, CardBody, CardFooter, CardHeader, Divider, Input } from "@nextui-org/react";
import { useInputStore } from "../../shared";

export const DataFilePathModal: React.FC = () => {
	const { filePaths, setFilePaths } = useInputStore();

	const [sensorDataFilePath, setSensorDataFilePath] = React.useState<string>(filePaths?.sensorDataFilePath || '');
	const [scriptFilePath, setScriptFilePath] = React.useState<string>(filePaths?.scriptFilePath || '');
	const [scriptOutput, setScriptOutput] = React.useState<string>("");

	// загрузка сохранённых путей
	useEffect(() => {
		const loadSavedPaths = async () => {
			const savedPaths = await window.electron.getFilePaths();
			if (savedPaths.sensorDataFilePath) {
				setSensorDataFilePath(savedPaths.sensorDataFilePath);
			}
			if (savedPaths.scriptFilePath) {
				setScriptFilePath(savedPaths.scriptFilePath);
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

	const onSubmitScriptFile = async () => {
		if (scriptFilePath) {
			setFilePaths({ scriptFilePath });
			await window.electron.setFilePaths({ scriptFilePath });
		}
	};

	// ---- выбор файлов ----
	const selectSensorsDataFilePath = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		const path = await window.electron.selectFile();
		if (path) {
			setSensorDataFilePath(path);
		}
	};

	const selectScriptFilePath = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		const path = await window.electron.selectFile();
		if (path) {
			setScriptFilePath(path);
		}
	};

	// ---- запуск python-скрипта ----
	const runPython = async () => {
		try {
			if (!scriptFilePath) {
				setScriptOutput("Ошибка: путь к скрипту не указан");
				return;
			}
			const result = await window.electron.runPythonScript(scriptFilePath, [sensorDataFilePath]);
			setScriptOutput(result);
		} catch (err: any) {
			setScriptOutput(`Ошибка: ${err.message}`);
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

			{/* Карточка выбора Python-скрипта */}
			<Card className="max-w-[400px]">
				<CardHeader>Укажите путь до Python-скрипта</CardHeader>
				<Divider />
				<CardBody onClick={selectScriptFilePath}>
					<Input placeholder="Python Script File Path" value={scriptFilePath} />
				</CardBody>
				<Divider />
				<CardFooter>
					<Button
						isDisabled={!scriptFilePath}
						color="primary"
						onClick={onSubmitScriptFile}
					>
						Сохранить
					</Button>
				</CardFooter>
			</Card>

			{/* Карточка запуска скрипта */}
			<Card className="max-w-[400px]">
				<CardHeader>Запуск Python-скрипта</CardHeader>
				<Divider />
				<CardBody>
					<p className="text-sm text-gray-600">
						Скрипт будет запущен с выбранным файлом данных как аргументом.
					</p>
				</CardBody>
				<Divider />
				<CardFooter className="flex gap-2">
					<Button
						isDisabled={!sensorDataFilePath || !scriptFilePath}
						color="secondary"
						onClick={runPython}
					>
						Run Script
					</Button>
				</CardFooter>
			</Card>

			{/* Вывод результата */}
			{scriptOutput && (
				<Card className="max-w-[400px]">
					<CardHeader>Результат выполнения</CardHeader>
					<Divider />
					<CardBody>
						<pre className="whitespace-pre-wrap">{scriptOutput}</pre>
					</CardBody>
				</Card>
			)}
		</div>
	);
};
