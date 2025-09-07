import React, { useEffect, useState } from 'react';
import { Button, Card, CardBody, CardHeader, Divider } from "@nextui-org/react";

export const LivePlotViewer: React.FC = () => {
  const [imgSrc, setImgSrc] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timer | null>(null);

  const scriptFilePath = "/path/to/saveToJson.py"; // путь к Python скрипту
  const outJson = "/path/to/output.json";          // путь к JSON
  const outPng  = "/path/to/output_plot.png";      // путь к PNG

  const runPython = async () => {
    setIsRunning(true);

    // Запускаем скрипт через Electron
    await window.electron.runPythonScript(scriptFilePath, [
      '--outfile', outJson,
      '--plot'
    ]);

    // Запускаем интервал обновления PNG
    const id = setInterval(() => {
      // добавляем случайный query param, чтобы избежать кэширования
      setImgSrc(`${outPng}?t=${Date.now()}`);
    }, 1000); // обновление каждую секунду
    setIntervalId(id);
  };

  const stopPython = () => {
    if (intervalId) clearInterval(intervalId);
    setIntervalId(null);
    setIsRunning(false);
  };

  useEffect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [intervalId]);

  return (
    <div className="flex flex-col gap-6">
      <Card className="max-w-[600px]">
        <CardHeader>Live-график каналов</CardHeader>
        <Divider />
        <CardBody>
          <div className="flex gap-2">
            <Button isDisabled={isRunning} onClick={runPython}>Запустить скрипт</Button>
            <Button isDisabled={!isRunning} color="error" onClick={stopPython}>Остановить</Button>
          </div>
          <div className="mt-4">
            {imgSrc && <img src={imgSrc} alt="Live Plot" style={{ width: '100%' }} />}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
