import { ipcMain, shell, dialog } from 'electron';
import { app } from 'electron';
import { copyFileSync, existsSync, statSync } from 'node:fs';
import { DatabaseLocation, getDatabasePathManager, initializeDatabasePath } from '../../db/config';
import { sensorDataService } from './sensor-data.service';
import { importDatabase, initDatabase, saveDatabase } from '../../db/db';

export function registerDatabaseIpc() {
  // Получить путь к базе данных
  ipcMain.handle('db:getPath', () => {
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
  });

  // Изменить расположение базы данных
  ipcMain.handle('db:changeLocation', async (_, location: DatabaseLocation, customPath?: string) => {
    try {
      console.log('[IPC] Changing database location to:', location, customPath);
      
      // Сохраняем текущую БД
      saveDatabase();
      
      // Обновляем конфигурацию
      initializeDatabasePath({ location, customPath });
      
      // Переинициализируем БД
      await initDatabase({ location, customPath });
      
      // Сохраняем настройку
      await app.whenReady();
      
      return { success: true, path: getDatabasePathManager().getPath() };
    } catch (err) {
      console.error('[IPC] Error changing location:', err);
      return { success: false, error: String(err) };
    }
  });

  // Выбрать кастомную папку
  ipcMain.handle('db:selectCustomPath', async (event) => {
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

  // Открыть папку с базой данных в проводнике
  ipcMain.handle('db:openFolder', () => {
    const pathManager = getDatabasePathManager();
    const dbPath = pathManager.getPath();
    const folderPath = require('path').dirname(dbPath);
    shell.openPath(folderPath);
    return folderPath;
  });

  // Получить статистику базы данных
  ipcMain.handle('db:getStats', async () => {
    try {
      const sessions = await sensorDataService.getAllSessions();
      const pathManager = getDatabasePathManager();
      const dbPath = pathManager.getPath();
      
      let totalRecords = 0;
      let totalSize = 0;
      
      if (existsSync(dbPath)) {
        const stats = statSync(dbPath);
        totalSize = stats.size;
      }
      
      return {
        totalSessions: sessions.length,
        totalRecords,
        totalSize,
        totalSizeFormatted: formatBytes(totalSize),
        sessions: sessions.slice(0, 10),
      };
    } catch (err) {
      console.error('[IPC] Error getting stats:', err);
      return null;
    }
  });

  // Остальные методы...
  ipcMain.handle('db:getDataByTimeRange', async (_, port: string, startTime: number, endTime: number, limit?: number) => {
    return await sensorDataService.getDataByTimeRange(port, startTime, endTime, limit);
  });

  ipcMain.handle('db:getLastRecords', async (_, port: string, limit?: number) => {
    return await sensorDataService.getLastRecords(port, limit);
  });

  ipcMain.handle('db:getChannelStats', async (_, port: string, channel: number, startTime: number, endTime: number) => {
    return await sensorDataService.getChannelStats(port, channel, startTime, endTime);
  });
}

function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


// Создать бэкап
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
    return { success: false, error: String(err) };
  }
});

// Восстановить из бэкапа
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
    return { success: false, error: String(err) };
  }
});

// Экспорт данных
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

    // Здесь добавьте логику экспорта в зависимости от формата
    // ...

    return { success: true, path: result.filePath };
  } catch (err) {
    return { success: false, error: String(err) };
  }
});
