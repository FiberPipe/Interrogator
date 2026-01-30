// src/electron/features/logger/logger.constants.ts

import path from 'path';

import type { LoggerConfig } from './logger.types';
import { LogLevelEnum } from './logger.types';

export const MAX_LOG_SIZE = 40 * 1024 * 1024; // 40 МБ
export const LOG_RETENTION_DAYS = 7;
export const LOG_DIR = path.join(process.cwd(), 'logs');
export const BATCH_SIZE = 100;
export const BATCH_INTERVAL = 5000;

export const COLORS = {
  RESET: '\x1b[0m',
  BRIGHT: '\x1b[1m',
  DIM: '\x1b[2m',

  DEBUG: '\x1b[36m', // Cyan
  INFO: '\x1b[32m', // Green
  WARN: '\x1b[33m', // Yellow
  ERROR: '\x1b[31m', // Red

  AREA: '\x1b[35m', // Magenta
  TIME: '\x1b[90m', // Gray
} as const;

export const DEFAULT_LOGGER_CONFIG: LoggerConfig = {
  enableConsole: true,
  enableFile: true,
  enableDatabase: true,
  minLevel: LogLevelEnum.DEBUG,
};
