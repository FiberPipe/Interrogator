// src/electron/features/database/database.ipc.ts

import { ipcMain, shell, dialog, app } from 'electron';
import { existsSync, statSync, copyFileSync } from 'node:fs';
import { dirname } from 'node:path';

import type { DatabaseLocation, DatabaseExportOptions } from './database.types';
import { DatabaseIPC } from './database.types';
import { formatBytes } from './database.utils';
import { getDatabasePathManager, initializeDatabasePath } from './database.config';
import { database } from './database';
import { logger } from '../logger';
import { createError } from '../../../shared/errors';
import { ErrorCodes } from '../../../shared/errors/error-codes';
import { sensorDataService } from './services/sensor-data.service';
import type { LogMetadata } from '../../../shared/types/logs.types';

export function registerDatabaseIpc(): void {
  logger.info('IPC', 'Registering database IPC handlers');

  // ==================== PATH & CONFIG ====================

  ipcMain.handle(DatabaseIPC.GetPath, () => {
    return logger.withLoggingSync('IPC', 'Get database path', () => {
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
    });
  });

  ipcMain.handle(
    DatabaseIPC.ChangeLocation,
    async (_, location: DatabaseLocation, customPath?: string) => {
      return logger.withLogging(
        'IPC',
        'Change database location',
        async () => {
          database.saveDatabase();
          initializeDatabasePath({ location, customPath });
          await database.initialize({ location, customPath });

          return {
            success: true,
            path: getDatabasePathManager().getPath(),
          };
        },
        { location, customPath },
      );
    },
  );

  ipcMain.handle(DatabaseIPC.SelectCustomPath, async () => {
    return logger.withLogging('IPC', 'Select custom database path', async () => {
      const result = await dialog.showOpenDialog({
        properties: ['openDirectory', 'createDirectory'],
        title: 'Select Database Folder',
        buttonLabel: 'Select Folder',
      });

      if (result.canceled || result.filePaths.length === 0) {
        return null;
      }

      return result.filePaths[0];
    });
  });

  ipcMain.handle(DatabaseIPC.OpenFolder, () => {
    return logger.withLoggingSync('IPC', 'Open database folder', () => {
      const pathManager = getDatabasePathManager();
      const folderPath = dirname(pathManager.getPath());
      void shell.openPath(folderPath);
      return folderPath;
    });
  });

  // ==================== STATISTICS ====================

  ipcMain.handle(DatabaseIPC.GetStats, async () => {
    return logger.withLogging('IPC', 'Get database stats', async () => {
      const sessions = await sensorDataService.getAllSessions();
      const dbPath = getDatabasePathManager().getPath();

      let totalSize = 0;
      if (existsSync(dbPath)) {
        totalSize = statSync(dbPath).size;
      }

      const activeSessions = sessions.filter((s) => s.status === 'active').length;

      return {
        totalSessions: sessions.length,
        totalRecords: 0,
        totalSize,
        totalSizeFormatted: formatBytes(totalSize),
        activeSessions,
        sessions: sessions.slice(0, 10),
      };
    });
  });

  ipcMain.handle(
    DatabaseIPC.GetChannelStats,
    async (_, port: string, channel: number, startTime: number, endTime: number) => {
      return logger.withLogging(
        'IPC',
        'Get channel stats',
        async () => {
          return await sensorDataService.getChannelStats(port, channel, startTime, endTime);
        },
        { port, channel, startTime, endTime },
      );
    },
  );

  ipcMain.handle(
    DatabaseIPC.GetChannelStatsAll,
    async (_, port: string, startTime: number, endTime: number) => {
      return logger.withLogging(
        'IPC',
        'Get all channel stats',
        async () => {
          return await sensorDataService.getAllChannelStats(port, startTime, endTime);
        },
        { port, startTime, endTime },
      );
    },
  );

  // ==================== DATA QUERIES ====================

  ipcMain.handle(
    DatabaseIPC.GetDataByTimeRange,
    async (_, port: string, startTime: number, endTime: number, limit?: number) => {
      return logger.withLogging(
        'IPC',
        'Get data by time range',
        async () => {
          return await sensorDataService.getDataByTimeRange(port, startTime, endTime, limit);
        },
        { port, startTime, endTime, limit },
      );
    },
  );

  ipcMain.handle(DatabaseIPC.GetLastRecords, async (_, port: string, limit?: number) => {
    return logger.withLogging(
      'IPC',
      'Get last records',
      async () => {
        return await sensorDataService.getLastRecords(port, limit);
      },
      { port, limit },
    );
  });

  // ==================== BACKUP & RESTORE ====================

  ipcMain.handle(DatabaseIPC.CreateBackup, async () => {
    return logger.withLogging('IPC', 'Create database backup', async () => {
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

      if (result.canceled || !result.filePath) {
        return { success: false, cancelled: true };
      }

      database.saveDatabase();
      copyFileSync(getDatabasePathManager().getPath(), result.filePath);

      return { success: true, path: result.filePath };
    });
  });

  ipcMain.handle(DatabaseIPC.RestoreBackup, async () => {
    return logger.withLogging('IPC', 'Restore database backup', async () => {
      const result = await dialog.showOpenDialog({
        title: 'Select Backup',
        filters: [
          { name: 'Database', extensions: ['db'] },
          { name: 'All Files', extensions: ['*'] },
        ],
        properties: ['openFile'],
      });

      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, cancelled: true };
      }

      await database.importDatabase(result.filePaths[0]);

      return { success: true };
    });
  });

  // ==================== EXPORT ====================

  ipcMain.handle(DatabaseIPC.ExportData, async (_, options: DatabaseExportOptions) => {
    return logger.withLogging(
      'IPC',
      'Export database data',
      async () => {
        const extensions = { csv: ['csv'], json: ['json'], sql: ['sql'] }[options.format];

        const result = await dialog.showSaveDialog({
          title: 'Export Data',
          defaultPath: `export-${Date.now()}.${extensions[0]}`,
          filters: [{ name: options.format.toUpperCase(), extensions }],
        });

        if (result.canceled || !result.filePath) {
          return { success: false, cancelled: true };
        }

        // TODO: Реализовать экспорт в разных форматах

        return { success: true, path: result.filePath };
      },
      options as unknown as LogMetadata,
    );
  });

  // ==================== MAINTENANCE ====================

  ipcMain.handle(DatabaseIPC.Vacuum, async () => {
    return logger.withLogging('IPC', 'Vacuum database', async () => {
      try {
        database.vacuum();
        return { success: true };
      } catch (err) {
        throw createError({
          code: ErrorCodes.DB_QUERY_FAILED,
          title: 'Vacuum Failed',
          description: 'Failed to vacuum database',
          cause: err,
          area: 'Database',
        });
      }
    });
  });

  ipcMain.handle(DatabaseIPC.Clear, async () => {
    return logger.withLogging('IPC', 'Clear database', async () => {
      try {
        database.clear();
        return { success: true };
      } catch (err) {
        throw createError({
          code: ErrorCodes.DB_WRITE_FAILED,
          title: 'Clear Failed',
          description: 'Failed to clear database',
          cause: err,
          area: 'Database',
        });
      }
    });
  });

  logger.info('IPC', 'Database IPC handlers registered successfully');
}
