import { BrowserWindow } from "electron";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { readJSONFile, writeJSONFile, getDataFilePath } from "./file-utils";

function ensureMeta(file: string) {
  let arr: any[] = [];
  try { if (fs.existsSync(file)) arr = JSON.parse(fs.readFileSync(file, "utf-8")); } catch {}
  if (!Array.isArray(arr) || arr.length === 0 || !arr[0]?.__meta) {
    const defModel = path.join(path.dirname(file), "best_model_Exponential_04_05_25_run2.pkl");
    arr = [{ __meta: { predictionMethods: {}, mlModelPath: defModel } }];
    writeJSONFile(file, arr);
  }
  return arr;
}

export async function handlePredictionMethods() {
  const file = getDataFilePath();
  const arr = ensureMeta(file);
  return (arr[0].__meta?.predictionMethods || {}) as Record<string, any>;
}

export async function handleSetPredictionMethod(sensorIndex: number, method: "Analytical" | "ML") {
  const file = getDataFilePath();
  const arr = ensureMeta(file);
  const meta = arr[0].__meta || {};
  const pm = { ...(meta.predictionMethods || {}) };
  pm[String(sensorIndex)] = method;
  arr[0].__meta = { ...meta, predictionMethods: pm };
  writeJSONFile(file, arr);
  return pm;
}

export async function clearDataFile(mainWindow: BrowserWindow, providedPath?: string) {
  try {
    const filePath = providedPath || getDataFilePath();
    if (!fs.existsSync(filePath)) {
      writeJSONFile(filePath, []);
    } else {
      const arr = JSON.parse(fs.readFileSync(filePath, "utf-8") || "[]");
      const keepMeta = Array.isArray(arr) && arr[0]?.__meta ? [arr[0]] : [];
      writeJSONFile(filePath, keepMeta);
    }

    BrowserWindow.getAllWindows().forEach((w) =>
      w.webContents.send("data-file-cleared", filePath)
    );
    return true;
  } catch (e) {
    console.error("clear-json error:", e);
    return false;
  }
}
