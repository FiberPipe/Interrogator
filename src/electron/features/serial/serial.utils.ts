// src/electron/features/serial/serial.utils.ts

import { logger } from '../logger';
import { createError } from '../../../shared/errors';
import { ErrorCodes } from '../../../shared/errors/error-codes';

/**
 * Очистка JSON строки от лишних пробелов
 */
export function cleanJSON(str: string): string {
  let result = str.trim();

  // 1. Удаляем пробелы внутри чисел
  result = result
    .replace(/(\d)\s+(\d)/g, '$1$2') // "123 456" → "123456"
    .replace(/(\d)\s+\./g, '$1.') // "1 .5" → "1.5"
    .replace(/\.\s+(\d)/g, '.$1'); // ". 5" → ".5"

  // 2. Удаляем пробелы внутри ключей: "P11 " → "P11"
  result = result.replace(/"([^"]+)"\s*:/g, (match, key: string) => {
    const cleanedKey = key.trim();
    return `"${cleanedKey}":`;
  });

  // 3. Удаляем длинные последовательности пробелов
  result = result.replace(/\s{10,}/g, ' ');

  // 4. Убираем пробелы вокруг JSON-разделителей
  result = result.replace(/\s*([,:{}[\]])\s*/g, '$1');

  return result;
}

/**
 * Парсинг JSON данных от датчика
 */
export function parseSerialData<T = unknown>(dataString: string): T | null {
  try {
    const cleaned = cleanJSON(dataString);
    const result = JSON.parse(cleaned) as T;

    logger.debug('Serial', 'Data parsed successfully', {
      originalLength: dataString.length,
      cleanedLength: cleaned.length,
    });

    return result;
  } catch (err) {
    const error = err as Error;

    logger.error('Serial', 'Parse error', { dataString }, err);

    // Пытаемся показать контекст ошибки
    const posMatch = error.message.match(/position (\d+)/);
    if (posMatch !== null) {
      const pos = parseInt(posMatch[1], 10);
      const cleaned = cleanJSON(dataString);

      logger.error('Serial', 'Error context', {
        position: pos,
        context: cleaned.substring(Math.max(0, pos - 40), pos + 40) as any,
      });
    }

    return null;
  }
}

/**
 * Валидация пути порта
 */
export function isValidPortPath(path: string): boolean {
  if (path.length === 0) {
    return false;
  }

  // Unix-like системы: /dev/tty*
  if (path.startsWith('/dev/')) {
    return true;
  }

  // Windows: COM*
  if (/^COM\d+$/i.test(path)) {
    return true;
  }

  return false;
}

/**
 * Форматирование имени порта для отображения
 */
export function formatPortName(info: {
  path: string;
  manufacturer?: string;
  serialNumber?: string;
}): string {
  const parts = [info.path];

  if (info.manufacturer !== undefined && info.manufacturer.length > 0) {
    parts.push(info.manufacturer);
  }

  if (info.serialNumber !== undefined && info.serialNumber.length > 0) {
    parts.push(`SN: ${info.serialNumber}`);
  }

  return parts.join(' - ');
}

/**
 * Извлечение индекса порта из пути
 */
export function extractPortIndex(path: string): number {
  const match = path.match(/\d+$/);
  return match !== null ? parseInt(match[0], 10) : 0;
}

/**
 * Создание ошибки порта
 */
export function createPortError(
  title: string,
  description: string,
  port: string,
  cause?: unknown,
): Error {
  return createError({
    code: ErrorCodes.SERIAL_PORT_ERROR,
    title,
    description,
    meta: { port },
    cause,
    area: 'Serial',
  });
}

/**
 * Создание ошибки таймаута
 */
export function createTimeoutError(operation: string, port: string, timeout: number): Error {
  return createError({
    code: ErrorCodes.SERIAL_TIMEOUT,
    title: 'Serial Timeout',
    description: `Operation "${operation}" timed out after ${timeout}ms`,
    meta: { port, operation, timeout },
    area: 'Serial',
  });
}

/**
 * Безопасное преобразование в число
 */
export function safeParseFloat(value: unknown, defaultValue = 0): number {
  if (typeof value === 'number') {
    return isNaN(value) ? defaultValue : value;
  }

  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  return defaultValue;
}

/**
 * Проверка является ли значение валидным числом
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}
