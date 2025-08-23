import { BrowserWindow } from "electron";
import { registerFileHandlers } from "./files";
import { registerDialogHandlers } from "./dialog";
import { registerLogHandlers } from "./logs";

export function registerIpcHandlers(mainWindow: BrowserWindow) {
  registerFileHandlers();
  registerDialogHandlers(mainWindow);
  registerLogHandlers();
}
