import * as fs from "node:fs";
import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";

export function startSensorCollector(
  filePath: string,
  serialPortPath: string = "COM13",
  inputs: Record<string, any> = {}
) {
  console.log("======================================");
  console.log("📡 Запуск сборщика данных");
  console.log("  Файл для записи:", filePath);
  console.log("  Последовательный порт:", serialPortPath);
  console.log("  Inputs:", inputs);
  console.log("======================================");

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "[]", "utf8");
  }

  const BAUD_RATE = 9600;
  const RECONNECT_INTERVAL = 3000;


  function handleData(line: string) {
    line = line.trim();
    if (!line) return;

    let pkt: any;
    try {
      pkt = JSON.parse(line);
    } catch (err) {
      console.error("❌ Ошибка JSON.parse:", err, "Исходная строка:", line);
      return;
    }

    // console.log("📥 Получен пакет:", pkt);

    const norm: Record<string, number> = {};
    const lambdaCentral: Record<string, number> = {};
    const fieldsArr = Array.isArray(inputs.fields) ? inputs.fields : null;
    const wavelengthsArr = Array.isArray(inputs.wavelengths) ? inputs.wavelengths : null;
    for (let i = 0; i < 16; i++) {
      const key = `P${i}`; // JSON приходит P0..P15

      const rawField = fieldsArr
        ? fieldsArr[i]
        : inputs[`field${i + 1}`]; // field1..field16

      const rawLambda = wavelengthsArr
        ? wavelengthsArr[i]          // массив с индексом 0..15
        : inputs[`lambdas_central${i}`]; // lambdas_central0..15

      const sub = rawField ? parseFloat((rawField as string).replace(",", ".")) : 0;
      const lam = rawLambda ? parseFloat((rawLambda as string).replace(",", ".")) : 0;

      const val = pkt[key];
      const num = typeof val === "number" ? val : parseFloat(val);

      norm[key] = isNaN(num) ? 0 : Math.max(0, num - sub);
      lambdaCentral[key] = isNaN(lam) ? 0 : lam;

      console.log(
        `norm[${key}] = num (${isNaN(num) ? "NaN" : num.toFixed(4)}) - sub (${sub.toFixed(4)}) = ${norm[key].toFixed(4)}, lambda=${lambdaCentral[key]}`
      );
    }

    const lambdaResults: Record<string, number> = {};
    const sensorCount = Number(inputs.sensorCount) || 0;
    const sensorP = inputs.sensorPorts ?? {}; // это объект { "0": [...], "1": [...] }

    for (let s = 0; s < sensorCount; s++) {
      const attached: string[] = Array.isArray(sensorP[s])
        ? sensorP[s].slice().sort((a: string, b: string) => {
          const na = parseInt(a.match(/\d+/)?.[0] ?? "0", 10);
          const nb = parseInt(b.match(/\d+/)?.[0] ?? "0", 10);
          return na - nb;
        })
        : [];

      if (attached.length < 2) {
        lambdaResults[`wavelength${s}`] = NaN;
        console.log(`sensor_${s}: недостаточно данных для расчета λ`);
        continue;
      }

      const weights = attached.map((p) => norm[p] ?? NaN);
      const lambdas = attached.map((p) => lambdaCentral[p] ?? 0);
      const sumWeights = weights.reduce((acc, w) => acc + (isFinite(w) ? w : 0), 0);


      const lambda =
        sumWeights > 0
          ? weights.reduce((acc, w, i) => acc + (isFinite(w) ? w * (lambdas[i] ?? 0) : 0), 0) / sumWeights
          : NaN;

      const lambda =
        sumWeights > 0
          ? weights.reduce((acc, w, i) => acc + (isFinite(w) ? w * (lambdas[i] ?? 0) : 0), 0) / sumWeights
          : NaN;

      try {
        const csvRaw = fs.readFileSync("data.csv", "utf-8");
        const lines = csvRaw.trim().split("\n");

        const headers = lines[0].split(",").map((h) => h.trim());
        const records = lines.slice(1).map((line) => {
          const values = line.split(",").map((v) => v.trim());
          return Object.fromEntries(headers.map((h, i) => [h, values[i]]));
        });

        console.log("📄 CSV data:");
        console.table(records);

        // 🔍 Ищем совпадение по wl_calc с точностью до тысячной (0.001)
        const match = records.find(
          (row) => Math.abs(parseFloat(row.wl_calc) - lambda) < 0.001
        );

        if (match) {
          console.log(`✅ Найдено совпадение λ=${lambda.toFixed(3)} → заменяем на ${match.spectrum_peak_nm_fit}`);
          lambdaResults[`wavelength${s}`] = parseFloat(match.spectrum_peak_nm_fit);
        } else {
          console.warn(`⚠️ Совпадение для λ=${lambda.toFixed(3)} не найдено, оставляем как есть`);
          lambdaResults[`wavelength${s}`] = lambda;
        }

      } catch (err) {
        console.error("❌ Ошибка при чтении CSV:", err);
      }


      // Подробное логирование в "формульном" стиле
      console.log(`\n📡 Sensor_${s} расчет λ`);
      console.log("--------------------------------------------------");

      // Формула для суммарного веса
      console.log(`Σw = ${weights.map((w) => w.toFixed(4)).join(" + ")} = ${sumWeights.toFixed(4)}`);

      // Формула для числителя (сумма wᵢ·λᵢ)
      const numerator = weights.reduce(
        (acc, w, i) => acc + (isFinite(w) ? w * (lambdas[i] ?? 0) : 0),
        0
      );

      const terms = weights.map((w, i) => `${w.toFixed(4)}·${lambdas[i].toFixed(2)}`);
      console.log(`Σ(wᵢ·λᵢ) = ${terms.join(" + ")} = ${numerator.toFixed(4)}`);

      // Итоговое выражение
      if (sumWeights > 0) {
        console.log(`λ = Σ(wᵢ·λᵢ) / Σw = ${numerator.toFixed(4)} / ${sumWeights.toFixed(4)} = ${lambda.toFixed(6)}`);
      } else {
        console.log("λ = NaN (Σw = 0)");
      }

      console.log("--------------------------------------------------");

      // Подробное логирование
      console.log(`sensor_${s}:`);
      console.log(`  attached P: ${attached}`);
      console.log(`  weights (norm - subtrac): ${weights.map((w) => w.toFixed(4))}`);
      console.log(`  lambdas (lambdaCentral): ${lambdas.map((l) => l.toFixed(4))}`);
      console.log(`  sumWeights: ${sumWeights.toFixed(4)}`);
      console.log(`  λ: ${lambda.toFixed(6)}`);
    }

    let data: any[] = [];
    try {
      data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      if (!Array.isArray(data)) data = [];
    } catch {
      data = [];
    }

    const finalRecord = {
      ...pkt,
      ...lambdaResults,
    };

    //console.log("📤 Записываю:", finalRecord);

    data.push(finalRecord);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  }

  function connectSerialPort() {
    const port = new SerialPort({ path: serialPortPath, baudRate: BAUD_RATE, autoOpen: false });
    port.open((err) => {
      if (err) {
        console.error("❌ Ошибка при подключении:", err.message);
        setTimeout(connectSerialPort, RECONNECT_INTERVAL);
        return;
      }
      console.log("✅ Успешно подключено к порту:", serialPortPath);
      const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));
      parser.on("data", handleData);
      port.on("close", () => {
        console.warn("⚠️ Порт закрыт, переподключение...");
        setTimeout(connectSerialPort, RECONNECT_INTERVAL);
      });
    });
  }

  connectSerialPort();
}


