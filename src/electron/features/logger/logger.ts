// src/electron/features/logger/logger.ts

import fs from 'fs';

import { BATCH_INTERVAL, BATCH_SIZE, COLORS, DEFAULT_LOGGER_CONFIG } from './logger.constants';
import type { ILogger, LoggerConfig } from './logger.types';
import { LogLevelEnum } from './logger.types';
import {
  ensureLogDirectory,
  getLogFilePath,
  cleanupOldLogs,
  generateOperationId,
  safeStringify,
} from './logger.utils';
import type { LogEntry, LogArea, LogMetadata, LogLevel } from '../../../shared/types/logs.types';
import { getAreaFromErrorCode } from '../../../shared/errors';
import { AppError } from '../../../shared/errors/error.types';

// Инициализация при импорте
ensureLogDirectory();
cleanupOldLogs();

export class Logger implements ILogger {
  private static instance: Logger;
  private logFilePath: string;
  private logBatch: LogEntry[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private dbWriter: ((logs: LogEntry[]) => Promise<void>) | null = null;
  private config: LoggerConfig;

  private constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_LOGGER_CONFIG, ...config };
    this.logFilePath = getLogFilePath();
    this.startBatchTimer();
  }

  static getInstance(config?: Partial<LoggerConfig>): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(config);
    }
    return Logger.instance;
  }

  /**
   * Регистрация функции записи в БД
   */
  setDatabaseWriter(writer: (logs: LogEntry[]) => Promise<void>): void {
    this.dbWriter = writer;
  }

  /**
   * Запуск таймера для периодического сброса батча
   */
  private startBatchTimer(): void {
    this.batchTimer = setInterval(() => {
      void this.flushBatch();
    }, BATCH_INTERVAL);
  }

  /**
   * Сброс батча в БД
   */
  private async flushBatch(): Promise<void> {
    if (this.logBatch.length === 0 || this.dbWriter === null || !this.config.enableDatabase) {
      return;
    }

    const batch = [...this.logBatch];
    this.logBatch = [];

    try {
      await this.dbWriter(batch);
    } catch (err) {
      console.error('[Logger] Failed to write batch to database:', err);
      // Возвращаем логи обратно в батч при ошибке
      this.logBatch.push(...batch);
    }
  }

  /**
   * Добавление лога в батч
   */
  private addToBatch(entry: LogEntry): void {
    if (!this.config.enableDatabase) return;

    this.logBatch.push(entry);

    if (this.logBatch.length >= BATCH_SIZE) {
      void this.flushBatch();
    }
  }

  /**
   * Запись в файл
   */
  private writeToFile(message: string): void {
    if (!this.config.enableFile) return;

    try {
      const stats = fs.existsSync(this.logFilePath) ? fs.statSync(this.logFilePath) : { size: 0 };

      if (stats.size >= 40 * 1024 * 1024) {
        this.logFilePath = getLogFilePath();
      }

      fs.appendFileSync(this.logFilePath, message + '\n', { encoding: 'utf8' });
    } catch (err) {
      console.error('[Logger] Failed to write log:', err);
    }
  }

  /**
   * Форматирование сообщения для файла
   */
  private formatFileMessage(
    level: LogLevel,
    area: LogArea,
    message: string,
    metadata?: LogMetadata,
  ): string {
    const timestamp = new Date().toISOString();
    let formatted = `[${level}] [${timestamp}] [${area}] ${message}`;

    if (metadata !== undefined && Object.keys(metadata).length > 0) {
      formatted += `\n  Metadata: ${safeStringify(metadata)}`;
    }

    return formatted;
  }

  /**
   * Форматирование сообщения для консоли (с цветами)
   */
  private formatConsoleMessage(
    level: LogLevel,
    area: LogArea,
    message: string,
    metadata?: LogMetadata,
  ): string {
    const timestamp = new Date().toISOString();
    const levelColor = COLORS[level] ?? COLORS.RESET;

    let formatted =
      `${levelColor}[${level}]${COLORS.RESET} ` +
      `${COLORS.TIME}[${timestamp}]${COLORS.RESET} ` +
      `${COLORS.AREA}[${area}]${COLORS.RESET} ` +
      `${message}`;

    if (metadata !== undefined && Object.keys(metadata).length > 0) {
      formatted += `\n${COLORS.DIM}Metadata:${COLORS.RESET} ${safeStringify(metadata)}`;
    }

    return formatted;
  }

  /**
   * Обработка ошибки и извлечение метаданных
   */
  private extractErrorMetadata(error: unknown): {
    metadata: LogMetadata;
    stack?: string;
    area?: LogArea;
  } {
    if (error instanceof AppError) {
      return {
        metadata: error.toLogMetadata(),
        stack: error.stack,
        area: error.area,
      };
    }

    if (error instanceof Error) {
      return {
        metadata: {
          errorType: error.name,
          errorMessage: error.message,
        },
        stack: error.stack,
      };
    }

    return {
      metadata: {
        error: String(error),
      },
    };
  }

  /**
   * Основной метод логирования
   */
  private log(
    level: LogLevel,
    logLevelEnum: LogLevelEnum,
    area: LogArea,
    message: string,
    metadata?: LogMetadata,
    error?: unknown,
  ): void {
    if (this.config.minLevel > logLevelEnum) return;

    const timestamp = Date.now();
    let finalMetadata = { ...metadata };
    let stack: string | undefined;
    let finalArea = area;

    // Обработка ошибки
    if (error !== undefined) {
      const errorData = this.extractErrorMetadata(error);
      finalMetadata = { ...finalMetadata, ...errorData.metadata };
      stack = errorData.stack;

      if (errorData.area !== undefined) {
        finalArea = errorData.area;
      }

      if (error instanceof AppError && errorData.area === undefined) {
        finalArea = getAreaFromErrorCode(error.code) as LogArea;
      }
    }

    // Создаём запись лога
    const logEntry: LogEntry = {
      timestamp,
      level,
      area: finalArea,
      message,
      metadata: Object.keys(finalMetadata).length > 0 ? safeStringify(finalMetadata) : undefined,
      stack,
    };

    // Форматируем для консоли и файла
    const consoleMessage = this.formatConsoleMessage(level, finalArea, message, finalMetadata);
    const fileMessage = this.formatFileMessage(level, finalArea, message, finalMetadata);

    // Выводим в консоль
    if (this.config.enableConsole) {
      const consoleMethod = level.toLowerCase() as 'debug' | 'info' | 'warn' | 'error';
      console[consoleMethod](consoleMessage);

      if (stack !== undefined) {
        console[consoleMethod](`${COLORS.DIM}Stack:${COLORS.RESET}\n${stack}`);
      }
    }

    // Записываем в файл
    if (this.config.enableFile) {
      let fullFileMessage = fileMessage;
      if (stack !== undefined) {
        fullFileMessage += `\n  Stack:\n${stack
          .split('\n')
          .map((l) => '    ' + l)
          .join('\n')}`;
      }
      this.writeToFile(fullFileMessage);
    }

    // Добавляем в батч для БД
    this.addToBatch(logEntry);
  }

  /**
   * Public API - Debug
   */
  debug(area: LogArea, message: string, metadata?: LogMetadata): void {
    this.log('DEBUG', LogLevelEnum.DEBUG, area, message, metadata);
  }

  /**
   * Public API - Info
   */
  info(area: LogArea, message: string, metadata?: LogMetadata): void {
    this.log('INFO', LogLevelEnum.INFO, area, message, metadata);
  }

  /**
   * Public API - Warn
   */
  warn(area: LogArea, message: string, metadata?: LogMetadata, error?: unknown): void {
    this.log('WARN', LogLevelEnum.WARN, area, message, metadata, error);
  }

  /**
   * Public API - Error
   */
  error(area: LogArea, message: string, metadata?: LogMetadata, error?: unknown): void {
    this.log('ERROR', LogLevelEnum.ERROR, area, message, metadata, error);
  }

  /**
   * Специальный метод для логирования AppError
   */
  logError(error: AppError, additionalMetadata?: LogMetadata): void {
    const area = (error.area ?? getAreaFromErrorCode(error.code)) as LogArea;
    const metadata = {
      ...error.toLogMetadata(),
      ...additionalMetadata,
    };

    this.error(area, error.description, metadata, error);
  }

  /**
   * Обертка для try/catch с автоматическим логированием (async)
   */
  async withLogging<T>(
    area: LogArea,
    operation: string,
    fn: () => Promise<T>,
    metadata?: LogMetadata,
  ): Promise<T> {
    const operationId = generateOperationId(area);
    const startTime = Date.now();

    this.debug(area, `Starting: ${operation}`, {
      ...metadata,
      operationId,
    });

    try {
      const result = await fn();
      const duration = Date.now() - startTime;

      this.info(area, `Completed: ${operation}`, {
        ...metadata,
        operationId,
        duration,
        status: 'success',
      });

      return result;
    } catch (err) {
      const duration = Date.now() - startTime;

      if (err instanceof AppError) {
        const errorArea = (err.area ?? getAreaFromErrorCode(err.code)) as LogArea;
        this.error(
          errorArea,
          `Failed: ${operation}`,
          {
            ...metadata,
            operationId,
            duration,
            status: 'error',
          },
          err,
        );
      } else {
        this.error(
          area,
          `Failed: ${operation}`,
          {
            ...metadata,
            operationId,
            duration,
            status: 'error',
          },
          err,
        );
      }

      throw err;
    }
  }

  /**
   * Обертка для try/catch с автоматическим логированием (sync)
   */
  withLoggingSync<T>(area: LogArea, operation: string, fn: () => T, metadata?: LogMetadata): T {
    const operationId = generateOperationId(area);
    const startTime = Date.now();

    this.debug(area, `Starting: ${operation}`, {
      ...metadata,
      operationId,
    });

    try {
      const result = fn();
      const duration = Date.now() - startTime;

      this.info(area, `Completed: ${operation}`, {
        ...metadata,
        operationId,
        duration,
        status: 'success',
      });

      return result;
    } catch (err) {
      const duration = Date.now() - startTime;

      if (err instanceof AppError) {
        const errorArea = (err.area ?? getAreaFromErrorCode(err.code)) as LogArea;
        this.error(
          errorArea,
          `Failed: ${operation}`,
          {
            ...metadata,
            operationId,
            duration,
            status: 'error',
          },
          err,
        );
      } else {
        this.error(
          area,
          `Failed: ${operation}`,
          {
            ...metadata,
            operationId,
            duration,
            status: 'error',
          },
          err,
        );
      }

      throw err;
    }
  }

  /**
   * Принудительный сброс всех логов
   */
  async shutdown(): Promise<void> {
    if (this.batchTimer !== null) {
      clearInterval(this.batchTimer);
      this.batchTimer = null;
    }
    await this.flushBatch();
  }
}

export const logger = Logger.getInstance();
