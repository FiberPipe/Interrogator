import { ipcMain, shell, dialog } from 'electron';
import { app } from 'electron';
import { existsSync, statSync, copyFileSync } from 'node:fs';
import { dirname } from 'node:path';

import type { DatabaseLocation } from '../config';
import { getDatabasePathManager, initializeDatabasePath } from '../config';
import { getDatabase, importDatabase, initDatabase, saveDatabase } from '../db';
import { sensorDataService } from '../service/sensor-data.service';
import { logger } from '../../logger/logger.utils';

// Утилита форматирования размера
function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function registerDatabaseIpc() {
  logger.info('[IPC] Registering database handlers...');

  // ==================== PATH & CONFIG ====================

  ipcMain.handle('db:getPath', () => {
    try {
      const pathManager = getDatabasePathManager();
      const dbPath = pathManager.getPath();
      const config = pathManager.getConfig();
      const exists = existsSync(dbPath);

      let size = 0;
      if (exists) {
        size = statSync(dbPath).size;
      }

      return {
        path: dbPath,
        exists,
        size,
        sizeFormatted: formatBytes(size),
        userDataPath: app.getPath('userData'),
        config,
        allPossiblePaths: pathManager.getAllPossiblePaths(),
      };
    } catch (err) {
      logger.error('[IPC] getPath error: ' + (err instanceof Error ? err.stack : String(err)));
      throw err;
    }
  });

  ipcMain.handle(
    'db:changeLocation',
    async (_, location: DatabaseLocation, customPath?: string) => {
      try {
        logger.info('[IPC] Changing location to:', location, customPath);

        saveDatabase();
        initializeDatabasePath({ location, customPath });
        await initDatabase({ location, customPath });

        return { success: true, path: getDatabasePathManager().getPath() };
      } catch (err) {
        logger.error(
          '[IPC] changeLocation error: ' + (err instanceof Error ? err.stack : String(err)),
        );
        return { success: false, error: String(err) };
      }
    },
  );

  ipcMain.handle('db:selectCustomPath', async () => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ['openDirectory', 'createDirectory'],
        title: 'Select Database Folder',
        buttonLabel: 'Select Folder',
      });

      if (result.canceled || result.filePaths.length === 0) return null;
      return result.filePaths[0];
    } catch (err) {
      logger.error(
        '[IPC] selectCustomPath error: ' + (err instanceof Error ? err.stack : String(err)),
      );
      return null;
    }
  });

  ipcMain.handle('db:openFolder', () => {
    try {
      const pathManager = getDatabasePathManager();
      const folderPath = dirname(pathManager.getPath());
      shell.openPath(folderPath);
      return folderPath;
    } catch (err) {
      logger.error('[IPC] openFolder error: ' + (err instanceof Error ? err.stack : String(err)));
      throw err;
    }
  });

  // ==================== STATISTICS ====================

  ipcMain.handle('db:getStats', async () => {
    try {
      const sessions = await sensorDataService.getAllSessions();
      const dbPath = getDatabasePathManager().getPath();

      let totalSize = 0;
      if (existsSync(dbPath)) totalSize = statSync(dbPath).size;

      const activeSessions = sessions.filter((s) => s.status === 'active').length;

      return {
        totalSessions: sessions.length,
        totalRecords: 0, // Можно добавить подсчёт
        totalSize,
        totalSizeFormatted: formatBytes(totalSize),
        activeSessions,
        sessions: sessions.slice(0, 10),
      };
    } catch (err) {
      logger.error('[IPC] getStats error: ' + (err instanceof Error ? err.stack : String(err)));
      return null;
    }
  });

  ipcMain.handle(
    'db:getChannelStats',
    async (_, port: string, channel: number, startTime: number, endTime: number) => {
      try {
        return await sensorDataService.getChannelStats(port, channel, startTime, endTime);
      } catch (err) {
        logger.error(
          '[IPC] getChannelStats error: ' + (err instanceof Error ? err.stack : String(err)),
        );
        throw err;
      }
    },
  );

  // ==================== DATA QUERIES ====================

  ipcMain.handle(
    'db:getDataByTimeRange',
    async (_, port: string, startTime: number, endTime: number, limit?: number) => {
      try {
        return await sensorDataService.getDataByTimeRange(port, startTime, endTime, limit);
      } catch (err) {
        logger.error(
          '[IPC] getDataByTimeRange error: ' + (err instanceof Error ? err.stack : String(err)),
        );
        throw err;
      }
    },
  );

  ipcMain.handle('db:getLastRecords', async (_, port: string, limit?: number) => {
    try {
      return await sensorDataService.getLastRecords(port, limit);
    } catch (err) {
      logger.error(
        '[IPC] getLastRecords error: ' + (err instanceof Error ? err.stack : String(err)),
      );
      throw err;
    }
  });

  // ==================== BACKUP & RESTORE ====================

  ipcMain.handle('db:createBackup', async () => {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupName = `sensor-data-backup-${timestamp}.db`;

      const result = await dialog.showSaveDialog({
        title: 'Save Backup',
        defaultPath: backupName,
        filters: [
          { name: 'Database', extensions: ['db'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      });

      if (result.canceled || !result.filePath) return { success: false, cancelled: true };

      saveDatabase();
      copyFileSync(getDatabasePathManager().getPath(), result.filePath);

      logger.info('[IPC] Backup created at: ' + result.filePath);
      return { success: true, path: result.filePath };
    } catch (err) {
      logger.error('[IPC] createBackup error: ' + (err instanceof Error ? err.stack : String(err)));
      return { success: false, error: String(err) };
    }
  });

  ipcMain.handle('db:restoreBackup', async () => {
    try {
      const result = await dialog.showOpenDialog({
        title: 'Select Backup',
        filters: [
          { name: 'Database', extensions: ['db'] },
          { name: 'All Files', extensions: ['*'] },
        ],
        properties: ['openFile'],
      });

      if (result.canceled || result.filePaths.length === 0)
        return { success: false, cancelled: true };

      await importDatabase(result.filePaths[0]);
      logger.info('[IPC] Backup restored from: ' + result.filePaths[0]);
      return { success: true };
    } catch (err) {
      logger.error(
        '[IPC] restoreBackup error: ' + (err instanceof Error ? err.stack : String(err)),
      );
      return { success: false, error: String(err) };
    }
  });

  // ==================== EXPORT ====================

  ipcMain.handle('db:exportData', async (_, options: { format: string; timeRange: string }) => {
    try {
      const extensions =
        options.format === 'csv' ? ['csv'] : options.format === 'json' ? ['json'] : ['sql'];

      const result = await dialog.showSaveDialog({
        title: 'Export Data',
        defaultPath: `export-${Date.now()}.${extensions[0]}`,
        filters: [{ name: options.format.toUpperCase(), extensions }],
      });

      if (result.canceled || !result.filePath) return { success: false, cancelled: true };

      // TODO: Реализовать экспорт в разных форматах
      logger.info('[IPC] Data exported to: ' + result.filePath);
      return { success: true, path: result.filePath };
    } catch (err) {
      logger.error('[IPC] exportData error: ' + (err instanceof Error ? err.stack : String(err)));
      return { success: false, error: String(err) };
    }
  });

  // ==================== MAINTENANCE ====================

  ipcMain.handle('db:vacuum', async () => {
    try {
      const db = getDatabase();
      db.run('VACUUM');
      saveDatabase();
      logger.info('[IPC] Database vacuum completed');
      return { success: true };
    } catch (err) {
      logger.error('[IPC] vacuum error: ' + (err instanceof Error ? err.stack : String(err)));
      return { success: false, error: String(err) };
    }
  });

  ipcMain.handle('db:clear', async () => {
    try {
      const db = getDatabase();

      db.run('DELETE FROM channel_data');
      db.run('DELETE FROM sensor_data');
      db.run('DELETE FROM sessions');
      db.run(
        'DELETE FROM sqlite_sequence WHERE name IN ("channel_data", "sensor_data", "sessions")',
      );
      db.run('VACUUM');

      saveDatabase();
      logger.info('[IPC] Database cleared successfully');
      return { success: true };
    } catch (err) {
      logger.error('[IPC] clear error: ' + (err instanceof Error ? err.stack : String(err)));
      return { success: false, error: String(err) };
    }
  });

  logger.info('[IPC] ✅ Database handlers registered');
}
