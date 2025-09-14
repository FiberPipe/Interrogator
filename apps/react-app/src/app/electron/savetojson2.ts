import * as fs from "fs";

export interface Packet {
  id_record: number;
  time: string;
  system_time: string;
  t_now?: number;
  [key: string]: any;
}

export interface Inputs {
  fields?: number[];
  wavelengths?: number[];
  sensorCount?: number;
  sensorP?: string[][];
  [key: string]: any;
}

let t0: number | null = null;

function parseTimeToSeconds(hms: string): number {
  const match = hms.match(/(\d{2}):(\d{2}):(\d{2})(?:.(\d+))?/);
  if (!match) return 0;
  const [, h, m, s, ms] = match;
  return (
    parseInt(h) * 3600 +
    parseInt(m) * 60 +
    parseInt(s) +
    (ms ? parseInt(ms) / 1e3 : 0)
  );
}

function parseMaybeNumber(v: any): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const s = v.trim();
    if (s === "") return 0;
    const n = parseFloat(s);
    return isNaN(n) ? 0 : n;
  }
  return 0;
}

export function handleData(line: string, inputs: Inputs, filePath: string) {
  line = line.trim();
  if (!line) return;

  let pkt: any;
  try {
    pkt = JSON.parse(line);
  } catch {
    return;
  }

  const norm: Record<string, number> = {};
  const lambdaCentral: Record<string, number> = {};
  const fieldsArr = Array.isArray(inputs.fields) ? inputs.fields : null;
  const wavelengthsArr = Array.isArray(inputs.wavelengths) ? inputs.wavelengths : null;

  for (let i = 0; i < 16; i++) {
    const key = `P${i}`;
    const rawField = fieldsArr ? fieldsArr[i] : inputs[`field${i + 1}`];
    const rawLambda = wavelengthsArr ? wavelengthsArr[i] : inputs[`wavelength${i + 1}`];

    const sub = rawField ? parseFloat(rawField as string) : 0;
    const lam = rawLambda ? parseFloat(rawLambda as string) : 0;

    const val = pkt[key];
    const num = typeof val === "number" ? val : parseFloat(val);
    norm[key] = isNaN(num) ? 0 : num - sub;
    lambdaCentral[key] = isNaN(lam) ? 0 : lam;
  }

  const lambdaResults: Record<string, number> = {};
  const sensorCount = Number(inputs.sensorCount) || 0;
  const sensorP = inputs.sensorP ?? [];

  for (let s = 0; s < sensorCount; s++) {
    const attached: string[] = Array.isArray(sensorP[s]) ? sensorP[s] : [];
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

    lambdaResults[`wavelength${s}`] = lambda;

    // Подробное логирование
    console.log(`sensor_${s}:`);
    console.log(`  attached P: ${attached}`);
    console.log(`  weights (norm - subtrac): ${weights.map((w) => w.toFixed(4))}`);
    console.log(`  lambdas (lambdaCentral): ${lambdas.map((l) => l.toFixed(4))}`);
    console.log(`  sumWeights: ${sumWeights.toFixed(4)}`);
    console.log(`  λ: ${lambda.toFixed(6)}`);
  }

  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const finalRecord = {
    ...pkt,
    ...lambdaResults
  };

  data.push(finalRecord);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}
