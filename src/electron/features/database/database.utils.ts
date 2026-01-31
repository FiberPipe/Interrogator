// src/electron/features/database/database.utils.ts

import type { Database as SqlJsDatabase } from 'sql.js';

import { SQLITE_PRAGMAS } from './database.constants';
import { logger } from '../logger';

/**
 * Форматирование размера в байтах
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Применение оптимизаций SQLite
 */
export function configureDatabaseOptimizations(db: SqlJsDatabase): void {
  try {
    db.run(`PRAGMA journal_mode = ${SQLITE_PRAGMAS.JOURNAL_MODE}`);
    db.run(`PRAGMA synchronous = ${SQLITE_PRAGMAS.SYNCHRONOUS}`);
    db.run(`PRAGMA cache_size = ${SQLITE_PRAGMAS.CACHE_SIZE}`);
    db.run(`PRAGMA temp_store = ${SQLITE_PRAGMAS.TEMP_STORE}`);

    logger.debug('Database', 'SQLite optimizations applied', SQLITE_PRAGMAS);
  } catch (err) {
    logger.error('Database', 'Failed to apply optimizations', {}, err);
  }
}

/**
 * Преобразование результата SQL.js в массив объектов
 */
export function sqlResultToArray<T>(result: any[]): T[] {
  if (result.length === 0) return [];

  const columns = result[0].columns;
  const values = result[0].values;

  return values.map((row: any) => {
    const obj: Record<string, unknown> = {};
    columns.forEach((col: string, idx: number) => {
      obj[col] = row[idx];
    });
    return obj as T;
  });
}

/**
 * Получить значение из первой строки результата
 */
export function getSingleValue<T>(result: any[], defaultValue: T): T {
  if (result.length === 0 || result[0].values.length === 0) {
    return defaultValue;
  }
  return (result[0].values[0][0] as T) ?? defaultValue;
}

/**
 * Выполнить запрос и получить массив объектов
 */
export function executeQuery<T>(db: SqlJsDatabase, sql: string, params: any[] = []): T[] {
  try {
    const result = db.exec(sql, params);
    return sqlResultToArray<T>(result);
  } catch (err) {
    logger.error('Database', 'Query execution failed', { sql, params }, err);
    throw err;
  }
}

/**
 * Создать индексы для таблицы
 */
export function createIndexes(db: SqlJsDatabase, indexes: string[]): void {
  indexes.forEach((sql) => {
    try {
      db.run(sql);
    } catch (err) {
      logger.warn('Database', 'Failed to create index', { sql }, err);
    }
  });
}
