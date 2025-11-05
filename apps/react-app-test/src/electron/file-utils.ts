import * as fs from "fs";
import * as path from "path";
import * as os from "os";

export const DEFAULT_INPUTS_PATH = path.join(os.homedir(), "Documents", "Interrogator", "inputs.json");
export const DEFAULT_FILE_PATHS_PATH = path.join(os.homedir(), "Documents", "Interrogator", "file_paths.json");

export function readJSONFile<T>(filePath: string, def: T): T {
  if (fs.existsSync(filePath)) {
    try { return JSON.parse(fs.readFileSync(filePath, "utf-8")); }
    catch { return def; }
  }
  return def;
}

export function writeJSONFile(filePath: string, data: any): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export function readDataFile<T extends any>(file: string, def: any = []): T {
  try {
    if (!fs.existsSync(file)) return def as T;
    const raw = fs.readFileSync(file, "utf-8");
    if (!raw.trim()) return def as T;
    const parsed = JSON.parse(raw);
    return (Array.isArray(parsed) ? parsed.slice(-200) : def) as T;
  } catch {
    return def as T;
  }
}

export function getDataFilePath(): string {
  const fp = readJSONFile<Record<string, string>>(DEFAULT_FILE_PATHS_PATH, {});
  return fp.sensorDataFilePath || path.join(os.homedir(), "Documents", "Interrogator", "data.json");
}
