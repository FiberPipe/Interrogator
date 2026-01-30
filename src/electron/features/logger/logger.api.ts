// src/electron/features/logger/logger.api.ts

import { ipcRenderer } from 'electron';

import { LogsIPC } from './logger.types';
import type {
  LogArea,
  LogEntry,
  LogLevel,
  LogMetadata,
  LogsAPI,
  LogsFilter,
  LogsStats,
} from '../../../shared/types/logs.types';

export const logsAPI: LogsAPI = {
  get(filter: LogsFilter): Promise<LogEntry[]> {
    return ipcRenderer.invoke(LogsIPC.Get, filter);
  },

  getStats(): Promise<LogsStats> {
    return ipcRenderer.invoke(LogsIPC.GetStats);
  },

  cleanup(): Promise<{ success: boolean; deletedCount: number; error?: string }> {
    return ipcRenderer.invoke(LogsIPC.Cleanup);
  },

  clear(): Promise<{ success: boolean; error?: string }> {
    return ipcRenderer.invoke(LogsIPC.Clear);
  },

  export(options?: {
    level?: string;
    area?: string;
    startTime?: number;
    endTime?: number;
  }): Promise<{ success: boolean; path?: string; cancelled?: boolean; error?: string }> {
    return ipcRenderer.invoke(LogsIPC.Export, options);
  },

  send(level: LogLevel, area: LogArea, message: string, metadata?: LogMetadata): void {
    const channelMap: Record<LogLevel, LogsIPC> = {
      DEBUG: LogsIPC.SendDebug,
      INFO: LogsIPC.SendInfo,
      WARN: LogsIPC.SendWarn,
      ERROR: LogsIPC.SendError,
    };

    const channel = channelMap[level];
    ipcRenderer.send(channel, area, message, metadata);
  },
};
