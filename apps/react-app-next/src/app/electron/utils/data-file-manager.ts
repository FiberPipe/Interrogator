import * as fs from 'fs';
import * as path from 'path';

export function writeDataFile(filePath: string, data: object): void {
  const dir = path.dirname(filePath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export function readDataFile<T = Record<string, any>>(
  filePath: string,
  defaultValue: T = {} as T,
  options?: {
    rowsCount?: number
  }
): T {
  if (!fs.existsSync(filePath)) {
    return defaultValue;
  }

  try {
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const parsedData: unknown = JSON.parse(rawData);

    if (Array.isArray(parsedData)) {
      return parsedData.slice(options?.rowsCount) as T;
    }

    return parsedData as T;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return defaultValue;
  }
}
