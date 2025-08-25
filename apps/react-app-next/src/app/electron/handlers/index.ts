import { BrowserWindow } from "electron";
import { registerFileHandlers } from "./files";
import { registerDialogHandlers } from "./dialog";
import { registerLogHandlers } from "./logs";
import { registerUserSettingsHandlers } from "./user-settings";
import { registerRestartHandler } from "./restart";

export function registerIpcHandlers(mainWindow: BrowserWindow) {
  registerFileHandlers();
  registerDialogHandlers(mainWindow);
  registerLogHandlers();
  registerUserSettingsHandlers();
  registerRestartHandler();
}
