// src/electron/ipc/logs.ipc.ts

import { ipcMain, dialog } from 'electron';
import { logger } from '../utils';
import { logsService } from '../../database/service/logs.service';

export function registerLogsIpc() {
  logger.info('[IPC] Registering logs handlers...');

  // Получение логов
  ipcMain.handle('logs:get', async (_, options) => {
    try {
      return await logsService.getLogs(options);
    } catch (err) {
      logger.error('[IPC] getLogs error:', err);
      throw err;
    }
  });

  // Статистика логов
  ipcMain.handle('logs:getStats', async () => {
    try {
      return await logsService.getStats();
    } catch (err) {
      logger.error('[IPC] getStats error:', err);
      throw err;
    }
  });

  // Очистка старых логов
  ipcMain.handle('logs:cleanup', async () => {
    try {
      const deletedCount = await logsService.cleanupOldLogs();
      return { success: true, deletedCount };
    } catch (err) {
      logger.error('[IPC] cleanup error:', err);
      return { success: false, error: String(err) };
    }
  });

  // Очистка всех логов
  ipcMain.handle('logs:clear', async () => {
    try {
      await logsService.clearAllLogs();
      return { success: true };
    } catch (err) {
      logger.error('[IPC] clear error:', err);
      return { success: false, error: String(err) };
    }
  });

  // Экспорт логов
  ipcMain.handle('logs:export', async (_, options) => {
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
      logger.error('[IPC] export error:', err);
      return { success: false, error: String(err) };
    }
  });

  logger.info('[IPC] ✅ Logs handlers registered');
}
