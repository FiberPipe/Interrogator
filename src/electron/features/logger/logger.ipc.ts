// src/electron/features/logger/logger.ipc.ts

import { ipcMain, dialog } from 'electron';

import { logger } from './logger';
import { LogsIPC } from './logger.types';
import type { LogsFilter, LogArea, LogMetadata } from '../../../shared/types/logs.types';
import { logsService } from '../database';

export function registerLoggerIpc(): void {
  logger.info('IPC', 'Registering logger IPC handlers');

  ipcMain.handle(LogsIPC.Get, async (_, filter: LogsFilter) => {
    return logger.withLogging(
      'IPC',
      'Get logs',
      async () => {
        return await logsService.getLogs(filter);
      },
      { filter },
    );
  });

  // Получение статистики
  ipcMain.handle(LogsIPC.GetStats, async () => {
    return logger.withLogging('IPC', 'Get logs statistics', async () => {
      return await logsService.getStats();
    });
  });

  // Очистка старых логов
  ipcMain.handle(LogsIPC.Cleanup, async () => {
    return logger.withLogging('IPC', 'Cleanup old logs', async () => {
      try {
        const deletedCount = await logsService.cleanupOldLogs();
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
        await logsService.clearAllLogs();
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

        if (result.canceled || !result.filePath) {
          return { success: false, cancelled: true };
        }

        const success = await logsService.exportToJson(result.filePath, options);
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
