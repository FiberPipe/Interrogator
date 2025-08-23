// logs.ts
import { ipcMain } from "electron";
import log from "electron-log";
import * as fs from "node:fs";
import * as path from "node:path";

function cleanupOldLogs(logDir: string, keep: number = 20) {
    const files = fs.readdirSync(logDir)
        .filter(f => f.startsWith("main-") && f.endsWith(".log"))
        .map(f => ({
            name: f,
            time: fs.statSync(path.join(logDir, f)).mtime.getTime(),
        }))
        .sort((a, b) => b.time - a.time);

    files.slice(keep).forEach(f => {
        fs.unlinkSync(path.join(logDir, f.name));
        log.info(`Удалён старый лог: ${f.name}`);
    });
}

export function setupLogger() {
    const logDir = path.resolve(process.cwd(), "logs");

    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }

    log.transports.file.resolvePath = () => path.join(logDir, "main.log");
    log.transports.file.maxSize = 5 * 1024 * 1024; // 5 MB

    log.transports.file.archiveLog = (file) => {
        const oldPath = file.path;
        const archivePath = oldPath.replace(/\.log$/, `-${Date.now()}.log`);
        fs.renameSync(oldPath, archivePath);

        cleanupOldLogs(logDir, 20);
        return archivePath;
    };

    // IPC хэндлеры для логов
    ipcMain.on("log-message", (_event, level: string, message: string) => {
        switch (level) {
            case "info":
                log.info(message);
                break;
            case "error":
                log.error(message);
                break;
            case "warn":
                log.warn(message);
                break;
            case "debug":
                log.debug(message);
                break;
            default:
                log.info(message);
        }
    });

    ipcMain.handle("logs:getFiles", async () => {
        return fs.readdirSync(logDir)
            .filter(f => f.endsWith(".log"))
            .map(f => {
                const fullPath = path.join(logDir, f);
                const stat = fs.statSync(fullPath);
                return {
                    name: f,
                    path: fullPath,
                    size: stat.size,
                    mtime: stat.mtimeMs,
                };
            });
    });

    ipcMain.handle("logs:readFile", async (_event, fileName: string) => {
        const logDir = path.resolve(process.cwd(), "logs");
        const fullPath = path.join(logDir, fileName);
    
        if (!fs.existsSync(fullPath)) {
            throw new Error(`Файл не найден: ${fullPath}`);
        }
    
        return fs.readFileSync(fullPath, "utf-8");
    });
    

    log.info("✅ Логгер инициализирован:", log.transports.file.getFile().path);
}

export { log };
