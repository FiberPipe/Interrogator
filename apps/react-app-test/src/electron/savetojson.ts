import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { MLPredictor } from "./mlPredictor";

type Method = "Analytical" | "ML";

async function pickSerialPortInteractive(): Promise<string> {
  let ports = await SerialPort.list();
  while (!ports.length) {
    console.log("Порты не найдены. Подключите устройство и Enter для повтора, или 'q' для выхода.");
    const rl0 = createInterface({ input, output });
    const ans = (await rl0.question("> ")).trim().toLowerCase();
    rl0.close();
    if (ans === "q" || ans === "й") throw new Error("Нет доступных последовательных портов.");
    ports = await SerialPort.list();
  }
  console.log("\n Доступные порты:");
  ports.forEach((p, i) => console.log(`  ${i + 1}. ${p.path}`));
  const rl = createInterface({ input, output });
  let chosen: string | undefined;
  while (!chosen) {
    const ans = (await rl.question(`\nВведите номер [1–${ports.length}] или путь к порту: `)).trim();
    const n = Number.parseInt(ans, 10);
    if (Number.isInteger(n) && n >= 1 && n <= ports.length) chosen = ports[n - 1].path;
    else if (ans) chosen = ans;
  }
  rl.close();
  return chosen!;
}

function ensureParentDir(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// работа с шапкой в data.json 
function ensureMetaHeader(filePath: string): { meta: any; data: any[] } {
  let arr: any[] = [];
  try {
    if (fs.existsSync(filePath)) {
      const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
      if (Array.isArray(parsed)) arr = parsed;
      else if (parsed && Array.isArray(parsed.data)) arr = parsed.data;
    }
  } catch {}
  if (!Array.isArray(arr) || arr.length === 0 || !arr[0]?.__meta) {
    const defModel = path.join(path.dirname(filePath), "best_model_Exponential_04_05_25_run2.pkl");
    arr = [{ __meta: { predictionMethods: {}, mlModelPath: defModel } }];
    fs.writeFileSync(filePath, JSON.stringify(arr, null, 2), "utf8");
  }
  return { meta: arr[0].__meta, data: arr };
}

function readMeta(filePath: string) {
  return ensureMetaHeader(filePath).meta as { predictionMethods?: Record<string, Method>; mlModelPath?: string };
}

export async function startSensorCollector(
  filePath: string,
  serialPortPath: string = "ASK",
  inputs: Record<string, any> = {}
) {
  if (!serialPortPath || serialPortPath.toUpperCase() === "ASK") {
    serialPortPath = await pickSerialPortInteractive();
  }

  console.log("Запуск сборщика данных");
  console.log("Файл для записи:", filePath);
  console.log("Последовательный порт:", serialPortPath);
  console.log("Inputs:", inputs);

  ensureParentDir(filePath);
  ensureMetaHeader(filePath); 

  const BAUD_RATE = 9600;
  const RECONNECT_INTERVAL = 3000;

  // ML 
  let { mlModelPath, predictionMethods } = readMeta(filePath);
  if (!mlModelPath) {
    mlModelPath = path.join(path.dirname(filePath), "best_model_Exponential_04_05_25_run2.pkl");
  }
  const predictor = new MLPredictor({ python: "python3", modelPath: mlModelPath });

  // подтягиваем изменения методов 
  try {
    fs.watchFile(filePath, { interval: 1000 }, () => {
      try {
        predictionMethods = readMeta(filePath).predictionMethods || {};
      } catch {}
    });
  } catch {}

  const queue: string[] = [];
  let busy = false;

  async function processQueue() {
    if (busy) return;
    busy = true;
    while (queue.length) {
      const line = queue.shift()!;
      await handleDataAsync(line).catch((e) => console.error("handleData error:", e));
    }
    busy = false;
  }

  async function handleDataAsync(line: string) {
    line = line.trim();
    if (!line) return;

    let pkt: any;
    try {
      pkt = JSON.parse(line);
    } catch (err) {
      console.error("Ошибка JSON.parse:", err, "Исходная строка:", line);
      return;
    }

    const norm: Record<string, number> = {};
    const lambdaCentral: Record<string, number> = {};
    const fieldsArr = Array.isArray(inputs.fields) ? inputs.fields : null;
    const wavelengthsArr = Array.isArray(inputs.wavelengths) ? inputs.wavelengths : null;

    for (let i = 0; i < 16; i++) {
      const key = `P${i}`;
      const rawField = fieldsArr ? fieldsArr[i] : inputs[`field${i + 1}`];
      const rawLambda = wavelengthsArr ? wavelengthsArr[i] : inputs[`lambdas_central${i}`];

      const sub = rawField ? parseFloat(String(rawField).replace(",", ".")) : 0;
      const lam = rawLambda ? parseFloat(String(rawLambda).replace(",", ".")) : 0;

      const val = pkt[key];
      const num = typeof val === "number" ? val : parseFloat(val);

      norm[key] = isNaN(num) ? 0 : Math.max(0, num - sub);
      lambdaCentral[key] = isNaN(lam) ? 0 : lam;
    }

    const lambdaResults: Record<string, number> = {};
    const sensorCount = Number(inputs.sensorCount) || 0;
    const sensorP = inputs.sensorPorts ?? {}; // { "0": ["P..."], ... }

    for (let s = 0; s < sensorCount; s++) {
      const attached: string[] = Array.isArray((sensorP as any)[s])
        ? (sensorP as any)[s].slice().sort((a: string, b: string) => {
            const na = parseInt(a.match(/\d+/)?.[0] ?? "0", 10);
            const nb = parseInt(b.match(/\d+/)?.[0] ?? "0", 10);
            return na - nb;
          })
        : [];

      // аналитика по умолчанию
      let lambda = NaN;
      if (attached.length >= 2) {
        const weights = attached.map((p) => norm[p] ?? NaN);
        const lambdas = attached.map((p) => lambdaCentral[p] ?? 0);
        const sumW = weights.reduce((acc, w) => acc + (isFinite(w) ? w : 0), 0);
        lambda =
          sumW > 0
            ? weights.reduce((acc, w, i) => acc + (isFinite(w) ? w * (lambdas[i] ?? 0) : 0), 0) / sumW
            : NaN;
      }

      // если выбран ML 
      const method = (predictionMethods?.[String(s)] as Method) || "Analytical";
      if (method === "ML" && attached.length === 4) {
        const feats = attached.map((p) => norm[p] ?? 0);
        try {
          const ml = await predictor.predict(feats);
          lambda = ml;
        } catch (e) {
          console.warn(`ML для sensor_${s} не сработал, оставляю Analytical.`, e);
        }
      }

      lambdaResults[`wavelength${s}`] = lambda;
    }

    // чтение + запись в файл 
    let arr: any[] = [];
    try {
      arr = JSON.parse(fs.readFileSync(filePath, "utf8"));
      if (!Array.isArray(arr)) arr = [];
    } catch {
      arr = [];
    }
    if (!(arr[0]?.__meta)) {
      const defModel = path.join(path.dirname(filePath), "best_model_Exponential_04_05_25_run2.pkl");
      arr.unshift({ __meta: { predictionMethods: predictionMethods || {}, mlModelPath: defModel } });
    }

    const finalRecord = { ...pkt, ...lambdaResults };
    arr.push(finalRecord);
    fs.writeFileSync(filePath, JSON.stringify(arr, null, 2), "utf8");
  }

  function connectSerialPort() {
    const port = new SerialPort({ path: serialPortPath, baudRate: BAUD_RATE, autoOpen: false });
    port.open((err) => {
      if (err) {
        console.error("Ошибка при подключении:", err.message);
        setTimeout(connectSerialPort, RECONNECT_INTERVAL);
        return;
      }
      console.log("Успешно подключено к порту:", serialPortPath);
      const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));
      parser.on("data", (line: string) => {
        queue.push(line);
        processQueue();
      });
      port.on("close", () => {
        console.warn("Порт закрыт, переподключение...");
        setTimeout(connectSerialPort, RECONNECT_INTERVAL);
      });
    });
  }
  connectSerialPort();
}
