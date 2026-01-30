// src/electron/features/logger/logger.utils.ts

import fs from 'fs';
import path from 'path';

import { LOG_DIR, LOG_RETENTION_DAYS, MAX_LOG_SIZE } from './logger.constants';

/**
 * Создание директории для логов
 */
export function ensureLogDirectory(): void {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

/**
 * Получение пути к файлу лога
 */
export function getLogFilePath(): string {
  const baseName = 'fbg_app.log';
  const basePath = path.join(LOG_DIR, baseName);

  if (!fs.existsSync(basePath)) return basePath;

  const stats = fs.statSync(basePath);
  if (stats.size < MAX_LOG_SIZE) return basePath;

  let index = 1;
  let newFile = path.join(LOG_DIR, `fbg_app_${index}.log`);

  while (fs.existsSync(newFile)) {
    index++;
    newFile = path.join(LOG_DIR, `fbg_app_${index}.log`);
  }

  return newFile;
}

/**
 * Очистка старых логов
 */
export function cleanupOldLogs(): void {
  if (!fs.existsSync(LOG_DIR)) return;

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

/**
 * Генерация уникального ID операции
 */
export function generateOperationId(area: string): string {
  return `${area.toLowerCase()}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Безопасное преобразование в JSON
 */
export function safeStringify(obj: unknown): string {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
}
