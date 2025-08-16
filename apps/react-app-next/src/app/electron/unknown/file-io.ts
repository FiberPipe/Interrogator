import { ipcMain } from "electron";
import { readDataFile, writeDataFile } from "../utils";
import * as path from "node:path";
import * as os from "node:os";

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

ipcMain.handle("getFilePaths", async () => {
    try {
        return readDataFile(DEFAULT_FILE_PATHS_PATH, {});
    } catch (e) {
        console.error(e);
        return {}
    }
});

ipcMain.handle("getSensorsData", async (_e: unknown, path: string) => {
    try {
        return readDataFile(path, []).slice(-200);
    } catch (e) {
        console.error(e);
        return [];
    }
});

ipcMain.handle("setFilePaths", async (_, filePaths) => {
    try {
        const currentPaths = readDataFile<Record<string, string>>(DEFAULT_FILE_PATHS_PATH, {});

        const updatedPaths = { ...currentPaths, ...filePaths };
    
        writeDataFile(DEFAULT_FILE_PATHS_PATH, updatedPaths);
    
        return updatedPaths;
    } catch(e) {
        console.error(e);
        return {}
    }
});