import React, { useState, useEffect } from "react";
import { Button, Card, CardBody, CardFooter, CardHeader, Divider, Input, Textarea, Chip } from "@nextui-org/react";
import { Play, Square, CircleInfo } from "@gravity-ui/icons";

interface ScriptInfo {
  path: string;
  pid?: number;
  isRunning: boolean;
  output: string;
  error: string;
}

interface PythonScriptManagerProps {
  scriptName: string;
  scriptKey: string;
}

export const PythonScriptManager: React.FC<PythonScriptManagerProps> = ({ scriptName, scriptKey }) => {
  const [scriptInfo, setScriptInfo] = useState<ScriptInfo>({
    path: "",
    isRunning: false,
    output: "",
    error: ""
  });
  const [pythonInfo, setPythonInfo] = useState<string>("");

  // Проверяем доступность Python при загрузке
  useEffect(() => {
    checkPythonAvailability();
  }, []);

  // Функция проверки Python
  const checkPythonAvailability = async () => {
    try {
      const info = await (window.electron as any).checkPython();
      if (info.available) {
        setPythonInfo(`Python found: ${info.version} (${info.command})`);
      } else {
        setPythonInfo("Python not found in PATH!");
        setScriptInfo(prev => ({
          ...prev,
          error: "Python is not installed or not in PATH. Please install Python and try again."
        }));
      }
    } catch (error) {
      setPythonInfo("Failed to check Python availability");
    }
  };

  const selectScriptPath = async () => {
    try {
      const path = await window.electron.selectFile();
      if (path) {
        setScriptInfo(prev => ({ ...prev, path }));
        // Сохраняем путь
        await window.electron.setFilePaths({ [scriptKey]: path });
      }
    } catch (error) {
      console.error('Error selecting file:', error);
      setScriptInfo(prev => ({
        ...prev,
        error: `Failed to select file: ${error}`
      }));
    }
  };

  const stopScript = async () => {
    if (scriptInfo.pid) {
      try {
        const success = await window.electron.killScript(scriptInfo.pid);
        if (success) {
          setScriptInfo(prev => ({
            ...prev,
            isRunning: false,
            output: prev.output + "\n\nScript was terminated by user"
          }));
        }
      } catch (error) {
        console.error('Failed to stop script:', error);
        setScriptInfo(prev => ({
          ...prev,
          error: prev.error + `\nFailed to stop script: ${error}`
        }));
      }
    }
  };


  const runScript = async () => {
    if (!scriptInfo.path) {
      alert("Please select a script first");
      return;
    }

    try {
      // Очищаем предыдущий вывод
      setScriptInfo(prev => ({
        ...prev,
        output: "",
        error: "",
        isRunning: true
      }));

      console.log(`Attempting to run script: ${scriptInfo.path}`);
      const { pid } = await window.electron.runPythonScript(scriptInfo.path);
      console.log(`Script started with PID: ${pid}`);
      
      setScriptInfo(prev => ({ ...prev, pid }));
    } catch (error: any) {
      console.error('Failed to start script:', error);
      setScriptInfo(prev => ({
        ...prev,
        error: `Failed to start script: ${error.message || error}`,
        isRunning: false
      }));
    }
  };

  return (
    <Card className="max-w-[600px] mb-4">
      <CardHeader className="flex justify-between items-center">
        <span className="text-lg font-semibold">{scriptName}</span>
        <div className="flex gap-2 items-center">
          {pythonInfo && (
            <Chip size="sm" variant="flat" color={pythonInfo.includes("found") ? "success" : "danger"}>
              {pythonInfo}
            </Chip>
          )}
          <Chip 
            color={scriptInfo.isRunning ? "success" : "default"} 
            variant="flat"
          >
            {scriptInfo.isRunning ? "Running" : "Stopped"}
          </Chip>
        </div>
      </CardHeader>

      <Divider />
      <CardBody className="gap-4">
        <div onClick={selectScriptPath} className="cursor-pointer">
          <Input 
            placeholder="Path to Python script" 
            value={scriptInfo.path}
            readOnly
            label="Script Path"
          />
        </div>
        
        {(scriptInfo.output || scriptInfo.error) && (
          <>
            <div className="space-y-2">
              {scriptInfo.output && (
                <div>
                  <p className="text-sm font-semibold mb-1">Output:</p>
                  <Textarea
                    value={scriptInfo.output}
                    readOnly
                    minRows={3}
                    maxRows={10}
                    className="font-mono text-xs"
                  />
                </div>
              )}
              
              {scriptInfo.error && (
                <div>
                  <p className="text-sm font-semibold mb-1 text-danger">Errors:</p>
                  <Textarea
                    value={scriptInfo.error}
                    readOnly
                    minRows={3}
                    maxRows={10}
                    className="font-mono text-xs text-danger"
                    color="danger"
                  />
                </div>
              )}
            </div>
          </>
        )}
      </CardBody>
      <Divider />
      <CardFooter className="gap-2">
        <Button
          color={scriptInfo.isRunning ? "danger" : "primary"}
          onClick={scriptInfo.isRunning ? stopScript : runScript}
          isDisabled={!scriptInfo.path}
          startContent={scriptInfo.isRunning ? <Square /> : <Play />}
        >
          {scriptInfo.isRunning ? "Stop" : "Run"}
        </Button>
      </CardFooter>
    </Card>
  );
};
