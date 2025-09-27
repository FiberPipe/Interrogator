import * as fs from "fs";
import * as path from "node:path";
import * as os from "node:os";
import { readJSONFile, writeJSONFile } from "../fs-utils";
import { DEFAULT_FILE_PATHS_PATH } from "../constants";

export const getDataFilePath = () => {
  const fp = readJSONFile<Record<string, string>>(DEFAULT_FILE_PATHS_PATH, {});
  return fp.sensorDataFilePath || path.join(os.homedir(), "Documents", "Interrogator", "data.json");
};

export const ensureMeta = (file: string) => {
  let arr: any[] = [];
  try { if (fs.existsSync(file)) arr = JSON.parse(fs.readFileSync(file, "utf-8")); } catch {}
  if (!Array.isArray(arr) || arr.length === 0 || !arr[0]?.__meta) {
    const defModel = path.join(path.dirname(file), "best_model_Exponential_04_05_25_run2.pkl");
    arr = [{ __meta: { predictionMethods: {}, mlModelPath: defModel } }];
    writeJSONFile(file, arr);
  }
  return arr;
};
