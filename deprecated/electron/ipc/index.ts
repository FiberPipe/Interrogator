import { BrowserWindow } from "electron";
import { registerFileIpc } from "./file";
import { registerInputsIpc } from "./inputs";
import { registerSensorsIpc } from "./sensors";
import { registerPredictionIpc } from "./prediction";

export function registerIpcHandlers(mainWindow: BrowserWindow) {
  registerFileIpc(mainWindow);
  registerInputsIpc(mainWindow);
  registerSensorsIpc(mainWindow);
  registerPredictionIpc(mainWindow);
}
