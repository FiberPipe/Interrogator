// src/electron/logger/utils.ts

import fs from 'fs';
import path from 'path';

import { CURRENT_LOG_LEVEL, LogLevel } from './types';

// -------------------- Настройки --------------------
const MAX_LOG_SIZE = 40 * 1024 * 1024; // 40 МБ
const LOG_RETENTION_DAYS = 7; // файловые логи
const LOG_DIR = path.join(process.cwd(), 'logs');

// Настройки батчинга для БД
const BATCH_SIZE = 100; // количество логов в батче
const BATCH_INTERVAL = 5000; // интервал сброса батча (5 сек)

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

cleanupOldLogs();

// -------------------- Типы --------------------
export interface LogEntry {
  timestamp: number;
  level: string;
  message: string;
  context?: string;
  stack?: string;
}

// -------------------- Logger --------------------
class Logger {
  private static instance: Logger;
  private logFilePath: string;
  private logBatch: LogEntry[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private dbWriter: ((logs: LogEntry[]) => Promise<void>) | null = null;

  private constructor() {
    this.logFilePath = getLogFilePath();
    this.startBatchTimer();
  }

  static getInstance(): Logger {
    if (!Logger.instance) Logger.instance = new Logger();
    return Logger.instance;
  }

  /**
   * Регистрация функции записи в БД
   */
  setDatabaseWriter(writer: (logs: LogEntry[]) => Promise<void>) {
    this.dbWriter = writer;
  }

  /**
   * Запуск таймера для периодического сброса батча
   */
  private startBatchTimer() {
    this.batchTimer = setInterval(() => {
      this.flushBatch();
    }, BATCH_INTERVAL);
  }

  /**
   * Сброс батча в БД
   */
  private async flushBatch() {
    if (this.logBatch.length === 0 || !this.dbWriter) return;

    const batch = [...this.logBatch];
    this.logBatch = [];

    try {
      await this.dbWriter(batch);
    } catch (err) {
      console.error('[Logger] Failed to write batch to database:', err);
      // В случае ошибки логи всё равно попадут в файл
    }
  }

  /**
   * Добавление лога в батч
   */
  private addToBatch(entry: LogEntry) {
    this.logBatch.push(entry);

    // Если батч переполнен, сбрасываем немедленно
    if (this.logBatch.length >= BATCH_SIZE) {
      this.flushBatch();
    }
  }

  /**
   * Запись в файл
   */
  private writeToFile(message: string) {
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

  /**
   * Форматирование сообщения
   */
  private formatMessage(level: string, ...args: any[]): { message: string; context?: any } {
    const timestamp = new Date().toISOString();
    
    // Разделяем строки и объекты
    const strings: string[] = [];
    const objects: any[] = [];

    args.forEach((arg) => {
      if (typeof arg === 'string') {
        strings.push(arg);
      } else if (arg !== undefined && arg !== null) {
        objects.push(arg);
      }
    });

    const msg = strings.join(' ');
    const context = objects.length > 0 ? objects : undefined;
    const fullMessage = `[${timestamp}] [${level}] ${msg}`;

    return { message: fullMessage, context };
  }

  private log(level: string, logLevel: LogLevel, ...args: any[]) {
    if (CURRENT_LOG_LEVEL > logLevel) return;

    const { message, context } = this.formatMessage(level, ...args);
    const timestamp = Date.now();

    // Определяем stack trace для ошибок
    let stack: string | undefined;
    const errorArg = args.find((arg) => arg instanceof Error);
    if (errorArg) {
      stack = errorArg.stack;
    }

    // Создаём запись лога
    const logEntry: LogEntry = {
      timestamp,
      level,
      message,
      context: context ? JSON.stringify(context) : undefined,
      stack,
    };

    // Выводим в консоль
    const consoleMethod = level.toLowerCase() as 'debug' | 'info' | 'warn' | 'error';
    console[consoleMethod](message, context || '');

    // Записываем в файл
    this.writeToFile(message + (context ? '\n' + JSON.stringify(context, null, 2) : ''));

    // Добавляем в батч для БД
    this.addToBatch(logEntry);
  }

  debug(...args: any[]) {
    this.log('DEBUG', LogLevel.DEBUG, ...args);
  }

  info(...args: any[]) {
    this.log('INFO', LogLevel.INFO, ...args);
  }

  warn(...args: any[]) {
    this.log('WARN', LogLevel.WARN, ...args);
  }

  error(...args: any[]) {
    this.log('ERROR', LogLevel.ERROR, ...args);
  }

  /**
   * Принудительный сброс всех логов (используется при завершении приложения)
   */
  async shutdown() {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
      this.batchTimer = null;
    }
    await this.flushBatch();
  }
}

export const logger = Logger.getInstance();
