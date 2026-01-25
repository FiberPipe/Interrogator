import path from 'path';
import os from 'os';

export const LOG_FILE_PATH = path.join(os.homedir(), 'fbg_app.log');

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export const CURRENT_LOG_LEVEL = LogLevel.DEBUG;
