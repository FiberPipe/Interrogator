// src/shared/types/global.d.ts

import type { AppDataAPI } from './app-data.types';
import type { DatabaseAPI } from './database.types';
import type { LogsAPI } from './logs.types';
import type { SerialAPI } from './serial.types';

declare global {
  interface Window {
    electron: {
      appData: AppDataAPI;
      logs: LogsAPI;
      database: DatabaseAPI;
      serial: SerialAPI;
    };
  }
}

export {};
