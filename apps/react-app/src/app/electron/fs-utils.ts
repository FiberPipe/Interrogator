import * as fs from "fs";
import * as path from "node:path";

export function readDataFile<T>(file: string, def: T): T {
  try {
    if (!fs.existsSync(file)) return def;
    const raw = fs.readFileSync(file, "utf-8");
    if (!raw.trim()) return def;
    const parsed = JSON.parse(raw);
    return (Array.isArray(parsed) ? parsed.slice(-200) : def) as T;
  } catch {
    return def;
  }
}

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
