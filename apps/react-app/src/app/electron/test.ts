import * as fs from "node:fs";
import { handleData, Inputs } from "./savetojson2";

import { join } from "node:path";
import * as path from "node:path";
import * as os from "node:os";

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
    // содержит настройки inputs

// Утилита для чтения JSON
function readJSONFile<T>(path: string, defaultValue: T): T {
  if (!fs.existsSync(path)) return defaultValue;
  try {
    const raw = fs.readFileSync(path, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

// Функция генерации случайного числа
function randomAround(base: number, deviation: number = 0.01): number {
  return base + (Math.random() - 0.5) * 2 * deviation;
}

// Генерация пакета данных
interface Packet {
  id_record: number;
  time: string;
  system_time: string;
  [key: string]: any;
}

function generatePacket(id: number): Packet {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  const ms = String(now.getMilliseconds()).padStart(3, "0");

  const pkt: Packet = {
    id_record: id,
    time: `${hh}:${mm}:${ss}.${ms}`,
    system_time: now.toISOString(),
  };

  for (let i = 0; i < 16; i++) {
    pkt[`P${i}`] = randomAround(2.5 + i * 0.1, 0.05);
    pkt[`stdDev${i}`] = randomAround(0.005, 0.003);
  }

  return pkt;
}

// Эмуляция потока данных на основе конфигурации из файлов
function waitForConfigAndStart() {
  let started = false;

  const interval = setInterval(() => {
    const filePaths = readJSONFile<Record<string, string>>(DEFAULT_FILE_PATHS_PATH, {});
    const inputsRaw = readJSONFile<Inputs>(DEFAULT_INPUTS_PATH, {});

    const sensorDataFilePath = filePaths["sensorDataFilePath"];
    const serialPortPath = filePaths["serialPortPath"] || "COM13";

    if (sensorDataFilePath && !started) {
      console.log("sensorDataFilePath найден:", sensorDataFilePath);
      console.log("serialPortPath найден:", serialPortPath);
      console.log("inputs:", inputsRaw);

      // создаём JSON-файл для хранения данных, если его нет
      if (!fs.existsSync(sensorDataFilePath)) fs.writeFileSync(sensorDataFilePath, "[]", "utf8");

      // запуск эмулятора бесконечного потока данных
      let id = 1;
      setInterval(() => {
        const packet = generatePacket(id++);

        console.log(packet)
        handleData(JSON.stringify(packet), inputsRaw, './test_data.json');
      }, 1000);

      started = true;
      clearInterval(interval);
    }
  }, 1000);
}

// Старт
waitForConfigAndStart();
