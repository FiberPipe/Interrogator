// src/electron/features/logger/logger.ipc.ts

import { ipcMain, dialog } from 'electron';

import { logger } from './logger';
import { LogsIPC } from './logger.types';
import { logsService } from '../database';
import { database } from '../database';
import type { LogArea, LogMetadata, LogsFilter } from '../../../shared/types/logs.types';

export function registerLoggerIpc(): void {
  logger.info('IPC', 'Registering logger IPC handlers');

  // Получение логов
  ipcMain.handle(LogsIPC.Get, async (_, filter: LogsFilter) => {
    return logger.withLogging(
      'IPC',
      'Get logs',
      async () => {
        const db = database.getDatabase();
        return await logsService.getLogs(db, filter);
      },
      { filter },
    );
  });

  // Получение статистики
  ipcMain.handle(LogsIPC.GetStats, async () => {
    return logger.withLogging('IPC', 'Get logs statistics', async () => {
      const db = database.getDatabase();
      return await logsService.getStats(db);
    });
  });

  // Очистка старых логов
  ipcMain.handle(LogsIPC.Cleanup, async () => {
    return logger.withLogging('IPC', 'Cleanup old logs', async () => {
      try {
        const db = database.getDatabase();
        const deletedCount = await logsService.cleanupOldLogs(db);
        return { success: true, deletedCount };
      } catch (err) {
        return {
          success: false,
          deletedCount: 0,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    });
  });

  // Полная очистка
  ipcMain.handle(LogsIPC.Clear, async () => {
    return logger.withLogging('IPC', 'Clear all logs', async () => {
      try {
        const db = database.getDatabase();
        await logsService.clearAllLogs(db);
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    });
  });

  // Экспорт логов
  ipcMain.handle(LogsIPC.Export, async (_, options) => {
    return logger.withLogging('IPC', 'Export logs', async () => {
      try {
        const result = await dialog.showSaveDialog({
          title: 'Export Logs',
          defaultPath: `logs-export-${Date.now()}.json`,
          filters: [{ name: 'JSON', extensions: ['json'] }],
        });

        if (result.canceled || result.filePath === undefined) {
          return { success: false, cancelled: true };
        }

        const db = database.getDatabase();
        const success = await logsService.exportToJson(db, result.filePath, options);
        return { success, path: result.filePath };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    });
  });

  // Приём логов из renderer процесса
  ipcMain.on(LogsIPC.SendDebug, (_, area: LogArea, message: string, metadata?: LogMetadata) => {
    logger.debug(area, `[Renderer] ${message}`, metadata);
  });

  ipcMain.on(LogsIPC.SendInfo, (_, area: LogArea, message: string, metadata?: LogMetadata) => {
    logger.info(area, `[Renderer] ${message}`, metadata);
  });

  ipcMain.on(LogsIPC.SendWarn, (_, area: LogArea, message: string, metadata?: LogMetadata) => {
    logger.warn(area, `[Renderer] ${message}`, metadata);
  });

  ipcMain.on(LogsIPC.SendError, (_, area: LogArea, message: string, metadata?: LogMetadata) => {
    logger.error(area, `[Renderer] ${message}`, metadata);
  });

  logger.info('IPC', 'Logger IPC handlers registered successfully');
}
