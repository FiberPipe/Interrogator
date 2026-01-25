import path from 'path';

export const LOG_FILE_PATH = path.join(process.cwd(), 'fbg_app.log');

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export const CURRENT_LOG_LEVEL = LogLevel.DEBUG;
