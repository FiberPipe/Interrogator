import * as fs from "node:fs";
import * as path from "node:path";
import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";

const DEFAULT_FILE_PATHS_PATH = "./filePaths.json"; // пример пути к JSON с путями

// --- Функция для чтения JSON ---
function readJSONFile<T>(filePath: string, defaultValue: T): T {
  try {
    const text = fs.readFileSync(filePath, "utf8");
    return JSON.parse(text) as T;
  } catch {
    return defaultValue;
  }
}

// --- Функция, которая запускает сбор данных ---
export function startSensorCollector(filePath: string) {
  console.log("Запуск сборщика данных, файл:", filePath);

  // Если файла нет — создаем с пустым массивом
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "[]", "utf8");
  }

  const SERIAL_PORT = "COM13";
  const BAUD_RATE = 9600;
  const RECONNECT_INTERVAL = 3000;
  let t0: number | null = null;

  function parseTimeToSeconds(hms: string): number {
    const match = hms.match(/(\d{2}):(\d{2}):(\d{2})(?:.(\d+))?/);
    if (!match) return 0;
    const [, h, m, s, ms] = match;
    return parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s) + (ms ? parseInt(ms) / 1e3 : 0);
  }

  function appendToJsonFile(pkt: any) {
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    data.push(pkt);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  }

  function handleData(line: string) {
    line = line.trim();
    if (!line) return;

    let pkt: any;
    try { pkt = JSON.parse(line); } catch { return; }

    const t_pkt = parseTimeToSeconds(pkt.time ?? "00:00:00");
    if (t0 === null) t0 = t_pkt;
    pkt.t_now = t_pkt - t0;

    const P1 = pkt.P1 ?? NaN;
    const P2 = pkt.P2 ?? NaN;
    const P4 = pkt.P4 ?? NaN;
    const P12 = pkt.P12 ?? NaN;

    const P1_norm = P1 - 2.515;
    const P2_norm = P2 - 2.820;
    const P4_norm = P4 - 2.600;
    const P12_norm = P12 - 2.560;

    const weights = [P1_norm, P2_norm, P4_norm, P12_norm];
    const lambdas = [1547.1, 1547.9, 1548.7, 1546.25];

    const sumWeights = weights.reduce((a, b) => a + (isFinite(b) ? b : 0), 0);
    pkt.lambda =
      sumWeights > 0
        ? weights.reduce((acc, w, i) => acc + (isFinite(w) ? w * lambdas[i] : 0), 0) / sumWeights
        : NaN;

    appendToJsonFile(pkt);
  }

  function connectSerialPort() {
    const port = new SerialPort({ path: SERIAL_PORT, baudRate: BAUD_RATE, autoOpen: false });
    port.open((err) => {
      if (err) {
        console.error("Ошибка при подключении:", err.message);
        setTimeout(connectSerialPort, RECONNECT_INTERVAL);
        return;
      }
      console.log("Успешно подключено к COM-порту");
      const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));
      parser.on("data", handleData);
      port.on("close", () => setTimeout(connectSerialPort, RECONNECT_INTERVAL));
    });
  }

  connectSerialPort();
}
