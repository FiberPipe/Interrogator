// src/electron/features/app-data/app-data.ipc.ts

import { ipcMain } from 'electron';

import { AppDataIPC } from './app-data.types';
import { appDataStorage } from './app-data';
import { logger } from '../logger';

export function registerAppDataIpc(): void {
  logger.info('IPC', 'Registering app-data IPC handlers');

  // Получить все настройки
  ipcMain.handle(AppDataIPC.GetAll, () => {
    return logger.withLoggingSync('IPC', 'Get all app-data', () => {
      return appDataStorage.getAll();
    });
  });

  // Получить значение
  ipcMain.handle(AppDataIPC.Get, (_, key: string) => {
    return logger.withLoggingSync(
      'IPC',
      'Get app-data value',
      () => {
        return appDataStorage.get(key);
      },
      { key },
    );
  });

  // Установить значение
  ipcMain.handle(AppDataIPC.Set, (_, key: string, value: unknown) => {
    return logger.withLoggingSync(
      'IPC',
      'Set app-data value',
      () => {
        appDataStorage.set(key, value);
      },
      { key, valueType: typeof value },
    );
  });

  // Удалить значение
  ipcMain.handle(AppDataIPC.Delete, (_, key: string) => {
    return logger.withLoggingSync(
      'IPC',
      'Delete app-data value',
      () => {
        appDataStorage.delete(key);
      },
      { key },
    );
  });

  // Обновить несколько значений
  ipcMain.handle(AppDataIPC.Patch, (_, patch: Record<string, unknown>) => {
    return logger.withLoggingSync(
      'IPC',
      'Patch app-data',
      () => {
        return appDataStorage.patch(patch);
      },
      { patchSize: Object.keys(patch).length },
    );
  });

  // Очистить все настройки
  ipcMain.handle(AppDataIPC.Clear, () => {
    return logger.withLoggingSync('IPC', 'Clear all app-data', () => {
      appDataStorage.clear();
    });
  });

  // Проверить существование ключа
  ipcMain.handle(AppDataIPC.Has, (_, key: string) => {
    return logger.withLoggingSync(
      'IPC',
      'Check app-data key',
      () => {
        return appDataStorage.has(key);
      },
      { key },
    );
  });

  logger.info('IPC', 'App-data IPC handlers registered successfully');
}
