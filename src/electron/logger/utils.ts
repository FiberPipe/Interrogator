/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
import { app } from 'electron';

import { CURRENT_LOG_LEVEL, LogLevel } from './types';

// -------------------- Настройки --------------------
const MAX_LOG_SIZE = 40 * 1024 * 1024; // 40 МБ
const LOG_RETENTION_DAYS = 7; // удалять старше 7 дней
const LOG_DIR = path.join(process.cwd(), 'logs');

// -------------------- Подготовка папки --------------------
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// -------------------- Получение пути к лог-файлу --------------------
function getLogFilePath(): string {
  const baseName = 'fbg_app.log';
  const basePath = path.join(LOG_DIR, baseName);

  if (!fs.existsSync(basePath)) return basePath;

  const stats = fs.statSync(basePath);

  if (stats.size < MAX_LOG_SIZE) {
    return basePath;
  }

  // Если размер превышен, создаём новый файл с индексом
  let index = 1;
  let newFile = path.join(LOG_DIR, `fbg_app_${index}.log`);

  while (fs.existsSync(newFile)) {
    index++;
    newFile = path.join(LOG_DIR, `fbg_app_${index}.log`);
  }

  return newFile;
}

// -------------------- Очистка старых логов --------------------
function cleanupOldLogs() {
  const files = fs.readdirSync(LOG_DIR);
  const now = Date.now();

  for (const file of files) {
    const filePath = path.join(LOG_DIR, file);
    try {
      const stats = fs.statSync(filePath);
      const ageDays = (now - stats.mtimeMs) / (1000 * 60 * 60 * 24);
      if (ageDays > LOG_RETENTION_DAYS) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.error(`[Logger] Failed to cleanup log ${file}:`, err);
    }
  }
}

// Запускаем очистку при старте
cleanupOldLogs();

// -------------------- Logger --------------------
class Logger {
  private static instance: Logger;
  private logFilePath: string;

  private constructor() {
    this.logFilePath = getLogFilePath();
  }

  static getInstance(): Logger {
    if (!Logger.instance) Logger.instance = new Logger();
    return Logger.instance;
  }

  private writeToFile(message: string) {
    // Проверяем размер файла перед записью
    try {
      const stats = fs.existsSync(this.logFilePath) ? fs.statSync(this.logFilePath) : { size: 0 };

      if (stats.size >= MAX_LOG_SIZE) {
        this.logFilePath = getLogFilePath();
      }

      fs.appendFileSync(this.logFilePath, message + '\n', { encoding: 'utf8' });
    } catch (err) {
      console.error('[Logger] Failed to write log:', err);
    }
  }

  private formatMessage(level: string, ...args: any[]) {
    const timestamp = new Date().toISOString();
    const msg = args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a, null, 2))).join(' ');
    return `[${timestamp}] [${level}] ${msg}`;
  }

  debug(...args: any[]) {
    if (CURRENT_LOG_LEVEL <= LogLevel.DEBUG) {
      const message = this.formatMessage('DEBUG', ...args);
      console.debug(message);
      this.writeToFile(message);
    }
  }

  info(...args: any[]) {
    if (CURRENT_LOG_LEVEL <= LogLevel.INFO) {
      const message = this.formatMessage('INFO', ...args);
      console.info(message);
      this.writeToFile(message);
    }
  }

  warn(...args: any[]) {
    if (CURRENT_LOG_LEVEL <= LogLevel.WARN) {
      const message = this.formatMessage('WARN', ...args);
      console.warn(message);
      this.writeToFile(message);
    }
  }

  error(...args: any[]) {
    if (CURRENT_LOG_LEVEL <= LogLevel.ERROR) {
      const message = this.formatMessage('ERROR', ...args);
      console.error(message);
      this.writeToFile(message);
    }
  }
}

export const logger = Logger.getInstance();
