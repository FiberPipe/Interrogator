import { ipcMain, app } from "electron";
import * as path from "path";
import log from "electron-log";
import { readDataFile, writeDataFile } from "../utils";

const SETTINGS_FILE = path.join(app.getPath("userData"), "settings.json");

type UserSettings = {
  theme?: "light" | "dark";
  language?: string;
};

export function registerUserSettingsHandlers() {
  ipcMain.handle("get-user-settings", async () => {
    const settings = readDataFile<UserSettings>(SETTINGS_FILE, {
      theme: "light",
      language: "en",
    });
    log.info("⚙️ Загружены настройки:", settings);
    return settings;
  });

  ipcMain.handle("save-user-settings", async (_, settings: UserSettings) => {
    writeDataFile(SETTINGS_FILE, settings);
    log.info("💾 Настройки сохранены:", settings);
    return true;
  });
}
