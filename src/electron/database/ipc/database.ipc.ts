import { ipcMain, shell, dialog } from 'electron';
import { app } from 'electron';
import { existsSync, statSync, copyFileSync } from 'node:fs';
import { dirname } from 'node:path';

import { getDatabasePathManager, initializeDatabasePath, DatabaseLocation } from '../config';
import { getDatabase, importDatabase, initDatabase, saveDatabase } from '../db';
import { sensorDataService } from '../service/sensor-data.service';

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
  console.log('[IPC] Registering database handlers...');

  // ==================== PATH & CONFIG ====================
  
  ipcMain.handle('db:getPath', () => {
    try {
      const pathManager = getDatabasePathManager();
      const dbPath = pathManager.getPath();
      const config = pathManager.getConfig();
      const exists = existsSync(dbPath);
      
      let size = 0;
      if (exists) {
        const stats = statSync(dbPath);
        size = stats.size;
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
      console.error('[IPC] getPath error:', err);
      throw err;
    }
  });

  ipcMain.handle('db:changeLocation', async (_, location: DatabaseLocation, customPath?: string) => {
    try {
      console.log('[IPC] Changing location to:', location, customPath);
      
      saveDatabase();
      initializeDatabasePath({ location, customPath });
      await initDatabase({ location, customPath });
      
      return { success: true, path: getDatabasePathManager().getPath() };
    } catch (err) {
      console.error('[IPC] changeLocation error:', err);
      return { success: false, error: String(err) };
    }
  });

  ipcMain.handle('db:selectCustomPath', async () => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ['openDirectory', 'createDirectory'],
        title: 'Select Database Folder',
        buttonLabel: 'Select Folder',
      });

      if (result.canceled || result.filePaths.length === 0) {
        return null;
      }

      return result.filePaths[0];
    } catch (err) {
      console.error('[IPC] selectCustomPath error:', err);
      return null;
    }
  });

  ipcMain.handle('db:openFolder', () => {
    try {
      const pathManager = getDatabasePathManager();
      const dbPath = pathManager.getPath();
      const folderPath = dirname(dbPath);
      shell.openPath(folderPath);
      return folderPath;
    } catch (err) {
      console.error('[IPC] openFolder error:', err);
      throw err;
    }
  });

  // ==================== STATISTICS ====================

  ipcMain.handle('db:getStats', async () => {
    try {
      const sessions = await sensorDataService.getAllSessions();
      const pathManager = getDatabasePathManager();
      const dbPath = pathManager.getPath();
      
      let totalSize = 0;
      let activeSessions = 0;
      
      if (existsSync(dbPath)) {
        const stats = statSync(dbPath);
        totalSize = stats.size;
      }

      // Считаем активные сессии
      activeSessions = sessions.filter(s => s.status === 'active').length;
      
      return {
        totalSessions: sessions.length,
        totalRecords: 0, // Можно добавить подсчёт
        totalSize,
        totalSizeFormatted: formatBytes(totalSize),
        activeSessions,
        sessions: sessions.slice(0, 10),
      };
    } catch (err) {
      console.error('[IPC] getStats error:', err);
      return null;
    }
  });

  ipcMain.handle('db:getChannelStats', async (_, port: string, channel: number, startTime: number, endTime: number) => {
    try {
      return await sensorDataService.getChannelStats(port, channel, startTime, endTime);
    } catch (err) {
      console.error('[IPC] getChannelStats error:', err);
      throw err;
    }
  });

  // ==================== DATA QUERIES ====================

  ipcMain.handle('db:getDataByTimeRange', async (_, port: string, startTime: number, endTime: number, limit?: number) => {
    try {
      return await sensorDataService.getDataByTimeRange(port, startTime, endTime, limit);
    } catch (err) {
      console.error('[IPC] getDataByTimeRange error:', err);
      throw err;
    }
  });

  ipcMain.handle('db:getLastRecords', async (_, port: string, limit?: number) => {
    try {
      return await sensorDataService.getLastRecords(port, limit);
    } catch (err) {
      console.error('[IPC] getLastRecords error:', err);
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
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      if (result.canceled || !result.filePath) {
        return { success: false, cancelled: true };
      }

      saveDatabase();
      const pathManager = getDatabasePathManager();
      const dbPath = pathManager.getPath();
      
      copyFileSync(dbPath, result.filePath);
      
      return { success: true, path: result.filePath };
    } catch (err) {
      console.error('[IPC] createBackup error:', err);
      return { success: false, error: String(err) };
    }
  });

  ipcMain.handle('db:restoreBackup', async () => {
    try {
      const result = await dialog.showOpenDialog({
        title: 'Select Backup',
        filters: [
          { name: 'Database', extensions: ['db'] },
          { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['openFile']
      });

      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, cancelled: true };
      }

      await importDatabase(result.filePaths[0]);
      
      return { success: true };
    } catch (err) {
      console.error('[IPC] restoreBackup error:', err);
      return { success: false, error: String(err) };
    }
  });

  // ==================== EXPORT ====================

  ipcMain.handle('db:exportData', async (_, options: { format: string; timeRange: string }) => {
    try {
      const extensions = options.format === 'csv' ? ['csv'] : options.format === 'json' ? ['json'] : ['sql'];
      
      const result = await dialog.showSaveDialog({
        title: 'Export Data',
        defaultPath: `export-${Date.now()}.${extensions[0]}`,
        filters: [{ name: options.format.toUpperCase(), extensions }]
      });

      if (result.canceled || !result.filePath) {
        return { success: false, cancelled: true };
      }

      // TODO: Реализовать экспорт в разных форматах
      
      return { success: true, path: result.filePath };
    } catch (err) {
      console.error('[IPC] exportData error:', err);
      return { success: false, error: String(err) };
    }
  });

  // ==================== MAINTENANCE ====================

  ipcMain.handle('db:vacuum', async () => {
    try {
      const db = getDatabase();
      db.run('VACUUM');
      saveDatabase();
      
      return { success: true };
    } catch (err) {
      console.error('[IPC] vacuum error:', err);
      return { success: false, error: String(err) };
    }
  });

  ipcMain.handle('db:clear', async () => {
    try {
      const db = getDatabase();
      
      db.run('DELETE FROM channel_data');
      db.run('DELETE FROM sensor_data');
      db.run('DELETE FROM sessions');
      db.run('DELETE FROM sqlite_sequence WHERE name IN ("channel_data", "sensor_data", "sessions")');
      db.run('VACUUM');
      
      saveDatabase();
      
      return { success: true };
    } catch (err) {
      console.error('[IPC] clear error:', err);
      return { success: false, error: String(err) };
    }
  });

  console.log('[IPC] ✅ Database handlers registered');
}
