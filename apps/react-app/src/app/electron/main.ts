import { BrowserWindow, app, ipcMain, globalShortcut, dialog, IpcMainInvokeEvent } from "electron";
import { join } from "node:path";
import { spawn, ChildProcess } from "child_process";
import * as fs from "fs";
import * as path from "node:path";
import * as os from "node:os";
import { ApiService } from "./api";

const DEFAULT_INPUTS_PATH = path.join(
  os.homedir(),
  "Documents",
  "Interrogator",
  "inputs.json"
);

const DEFAULT_FILE_PATHS_PATH = path.join(
  os.homedir(),
  "Documents",
  "Interrogator",
  "file_paths.json"
);

function getPythonCommand(): string {
  // Для Windows попробуем разные варианты
  if (process.platform === 'win32') {
    const pythonCommands = ['python', 'python3', 'py'];
    
    for (const cmd of pythonCommands) {
      try {
        const result = require('child_process').execSync(`${cmd} --version`, { encoding: 'utf8' });
        if (result.includes('Python')) {
          return cmd;
        }
      } catch (e) {
        // Продолжаем поиск
      }
    }
  } else {
    // Для Unix-подобных систем
    const pythonCommands = ['python3', 'python'];
    
    for (const cmd of pythonCommands) {
      try {
        const result = require('child_process').execSync(`which ${cmd}`, { encoding: 'utf8' });
        if (result) {
          return cmd;
        }
      } catch (e) {
        // Продолжаем поиск
      }
    }
  }
  
  return 'python'; // Значение по умолчанию
}

ipcMain.handle("killScript", async (
  event: IpcMainInvokeEvent, 
  pid: number
): Promise<boolean> => {
  const process: ChildProcess | undefined = runningScripts.get(pid);
  
  if (process && !process.killed) {
    process.kill('SIGTERM'); // Можно указать сигнал явно
    runningScripts.delete(pid);
    return true;
  }
  
  return false;
});

interface ScriptOutputData {
  pid: number;
  output: string;
}

interface ScriptErrorData {
  pid: number;
  error: string;
}

interface ScriptExitData {
  pid: number;
  code: number | null;
}

interface RunScriptResult {
  pid: number;
}

const runningScripts = new Map<number, ChildProcess>();

const convertDataToJSON = (lastLines: string) => {
  if (!lastLines) return [];

  const DEFAULT_EOL = /,\s*[\r\n]+/;
  const lines = String(lastLines).trim().split(DEFAULT_EOL);

  // console.log("parsedLinesToArray", lines);

  const processedLines = lines.map((line: string) => {
    try {
      const parsedLine = JSON.parse(line);
      // console.log("Parsed successfully:", parsedLine);
      return parsedLine;
    } catch (error) {
      console.error("Error parsing JSON line:", line);
      console.error("Error message:", error);
      return null;
    }
  });

  // console.log("processedLinesToJSONObj", processedLines);

  return processedLines.filter((row) => row !== null).slice(-200);
};

async function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1080,
    height: 720,
    webPreferences: {
      preload: join(app.getAppPath(), "build/src/app/electron/bridge.js"),
    },
  });

  globalShortcut.register("F12", () => {
    mainWindow.webContents.toggleDevTools();
  });

  const env = process.env.NODE_ENV || "development";

  if (env === "production") {
    await mainWindow.loadFile("build/index.html");
  } else {
    await mainWindow.loadURL("http://localhost:3000/");
    // await mainWindow.loadFile("build/index.html");
  }

  ipcMain.handle("selectFile", async () => {
    return new Promise((res) => {
      const k = dialog.showOpenDialogSync(mainWindow, {
        properties: ["openFile"],
      });

      const result = Array.isArray(k) ? k[0] : k;

      res(result);
    });
  });

  return mainWindow;
}

function readDataFile<T extends Record<string, string> | string>(
  path: string,
  defaultValue = {}
): T {
  if (fs.existsSync(path)) {
    const rawData = fs.readFileSync(path, "utf-8");

    return JSON.parse(rawData).slice(-200) as T;
  }

  return defaultValue as T;
}

function readDataFileInputs<T extends Record<string, string> | string>(
  path: string,
  defaultValue = {}
): T {
  if (fs.existsSync(path)) {
    const rawData = fs.readFileSync(path, "utf-8");

    try {
      return JSON.parse(rawData);
    } catch (err) {
      return rawData as T;
    }
  }

  return defaultValue as T;
}

function writeDataFile(filePath: string, data: Record<string, any>): void {
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

ipcMain.handle("getInputs", async (_e: unknown) => {
  return readDataFileInputs(DEFAULT_INPUTS_PATH, []);
});

ipcMain.handle("getSensorsData", async (_e: unknown, path: string) => {
  console.log({ path });
  return readDataFile(path, []);
});

ipcMain.handle(
  "insertInput",
  async (event: any, key: string, value: string) => {
    const data =
      readDataFileInputs<Record<string, string>>(DEFAULT_INPUTS_PATH);

    data[key] = value;

    writeDataFile(DEFAULT_INPUTS_PATH, data);
  }
);

ipcMain.handle("getFilePaths", async () => {
  return readDataFileInputs(DEFAULT_FILE_PATHS_PATH, {});
});

ipcMain.handle("setFilePaths", async (_, filePaths) => {
  const currentPaths = readDataFileInputs<Record<string, string>>(DEFAULT_FILE_PATHS_PATH, {});
  const updatedPaths = { ...currentPaths, ...filePaths };
  writeDataFile(DEFAULT_FILE_PATHS_PATH, updatedPaths);
  return updatedPaths;
});

app.whenReady().then(async () => {
  let window = await createWindow();

  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      window = await createWindow();
    }
  });

  const apiService = new ApiService(window);
  apiService.start();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.handle("runPythonScript", async (
  event: IpcMainInvokeEvent, 
  scriptPath: string, 
  args: string[] = []
): Promise<RunScriptResult> => {
  try {
    // Проверяем существование файла
    if (!fs.existsSync(scriptPath)) {
      throw new Error(`Script file not found: ${scriptPath}`);
    }

    // Получаем правильную команду Python
    const pythonCmd = getPythonCommand();
    console.log(`Using Python command: ${pythonCmd}`);

    // Опции для spawn
    const spawnOptions = {
      shell: process.platform === 'win32', // Используем shell на Windows
      env: { ...process.env }, // Передаем переменные окружения
    };

    // Запускаем Python скрипт
    const pythonProcess: ChildProcess = spawn(pythonCmd, [scriptPath, ...args], spawnOptions);
    
    // Ждем немного для получения PID
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const pid: number | undefined = pythonProcess.pid;

    if (!pid) {
      throw new Error("Failed to start Python script - no PID received");
    }

    console.log(`Started Python script with PID: ${pid}`);

    // Сохраняем процесс для отслеживания
    runningScripts.set(pid, pythonProcess);

    // Отправляем output в renderer процесс
    if (pythonProcess.stdout) {
      pythonProcess.stdout.on("data", (data: Buffer) => {
        const outputData: ScriptOutputData = { 
          pid, 
          output: data.toString() 
        };
        console.log(`Script output: ${data.toString().trim()}`);
        event.sender.send("script-output", outputData);
      });
    }

    // Отправляем ошибки в renderer процесс
    if (pythonProcess.stderr) {
      pythonProcess.stderr.on("data", (data: Buffer) => {
        const errorData: ScriptErrorData = { 
          pid, 
          error: data.toString() 
        };
        console.error(`Script error: ${data.toString().trim()}`);
        event.sender.send("script-error", errorData);
      });
    }

    // Обрабатываем завершение процесса
    pythonProcess.on("exit", (code: number | null) => {
      console.log(`Script exited with code: ${code}`);
      runningScripts.delete(pid);
      const exitData: ScriptExitData = { 
        pid, 
        code: code ?? -1 
      };
      event.sender.send("script-exit", exitData);
    });

    // Обрабатываем ошибки процесса
    pythonProcess.on("error", (error: Error) => {
      console.error(`Process error: ${error.message}`);
      runningScripts.delete(pid);
      const errorData: ScriptErrorData = { 
        pid, 
        error: `Process error: ${error.message}` 
      };
      event.sender.send("script-error", errorData);
    });

    return { pid };
  } catch (error) {
    console.error('Failed to run Python script:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to run Python script: ${error.message}`);
    }
    throw new Error("Unknown error occurred while running Python script");
  }
});

// Добавим диагностический метод
ipcMain.handle("checkPython", async (): Promise<{ available: boolean; version?: string; command?: string }> => {
  try {
    const pythonCmd = getPythonCommand();
    const result = require('child_process').execSync(`${pythonCmd} --version`, { encoding: 'utf8' });
    
    return {
      available: true,
      version: result.trim(),
      command: pythonCmd
    };
  } catch (error) {
    return {
      available: false
    };
  }
});


// Опциональные вспомогательные типы для экспорта
export type {
  ScriptOutputData,
  ScriptErrorData,
  ScriptExitData,
  RunScriptResult,
};