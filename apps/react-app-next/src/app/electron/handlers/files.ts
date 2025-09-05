import { ipcMain } from "electron";
import * as path from "node:path";
import * as os from "node:os";
import { readDataFile, writeDataFile } from "../utils";
import log from "electron-log";

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

export function registerFileHandlers() {
  ipcMain.handle("getFilePaths", async () => {
    try {
      const data = readDataFile(DEFAULT_FILE_PATHS_PATH, {});
      log.info("📖 Загружены пути файлов");
      return data;
    } catch (e) {
      log.error("❌ Ошибка при чтении путей файлов", e);
      return {};
    }
  });

  ipcMain.handle("getSensorsData", async (_e: unknown, path: string) => {
    try {
      const data = readDataFile(path, []).slice(-200);
      log.info(`📊 Загружены данные датчиков из ${path}`);
      return data;
    } catch (e) {
      log.error(`❌ Ошибка при чтении данных датчиков: ${path}`, e);
      return [];
    }
  });

  ipcMain.handle("setFilePaths", async (_e, filePaths) => {
    try {
      const currentPaths = readDataFile<Record<string, string>>(
        DEFAULT_FILE_PATHS_PATH,
        {}
      );
      const updatedPaths = { ...currentPaths, ...filePaths };
      writeDataFile(DEFAULT_FILE_PATHS_PATH, updatedPaths);
      log.info("💾 Пути файлов обновлены", updatedPaths);
      return updatedPaths;
    } catch (e) {
      log.error("❌ Ошибка при сохранении путей файлов", e);
      return {};
    }
  });

  ipcMain.handle("insertInput", async (_e, key: string, value: string) => {
    try {
      const data = readDataFile<Record<string, string>>(DEFAULT_INPUTS_PATH, {});
      data[key] = value;
      writeDataFile(DEFAULT_INPUTS_PATH, data);
      log.info("💾 Записан инпут", key, value);
      return data;
    } catch (e) {
      log.error("❌ Ошибка при сохранении инпутов", e);
      return {};
    }
  });

  ipcMain.handle("getInputs", async (_e: unknown) => {
    try {
      log.info("💾 Получен файл с инпутами");
      return readDataFile<Record<string, string>>(DEFAULT_INPUTS_PATH, {});
    } catch (e) {
      log.error("❌ Ошибка при чтении инпутов", e);
      return {};
    }
  });
}
