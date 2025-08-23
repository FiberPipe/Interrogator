import { ipcMain, shell } from "electron";
import log from "electron-log";

export function registerLogHandlers() {
    ipcMain.on(
        "log-message",
        (_event, level: keyof typeof log | "custom", message: string, meta?: unknown) => {
            try {
                if (level in log) {
                    // electron-log умеет уровни: error, warn, info, verbose, debug, silly
                    (log as any)[level](message, meta ?? "");
                } else {
                    log.info(`[CUSTOM] ${message}`, meta ?? "");
                }
            } catch (err) {
                log.error("❌ Ошибка в log-message handler:", err);
            }
        }
    );

    ipcMain.on("log-error", (_event, error: { message: string; stack?: string }) => {
        log.error("🚨 Ошибка из renderer:", error.message);
        if (error.stack) {
            log.error(error.stack);
        }
    });

    ipcMain.handle("getLogPath", () => {
        return log.transports.file.getFile().path;
    });

    ipcMain.handle("openLogFile", async () => {
        const filePath = log.transports.file.getFile().path;
        await shell.openPath(filePath);
        return filePath;
    });
}
