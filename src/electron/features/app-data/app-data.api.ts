// src/electron/features/app-data/app-data.api.ts

import { ipcRenderer } from 'electron';

import { AppDataIPC } from './app-data.types';
import type { AppDataAPI, AppSettings } from '../../../shared/types/app-data.types';

export const appDataAPI: AppDataAPI = {
  /**
   * Получить все настройки
   */
  getAll(): Promise<AppSettings> {
    return ipcRenderer.invoke(AppDataIPC.GetAll);
  },

  /**
   * Получить значение по ключу
   */
  get<T = unknown>(key: string): Promise<T | undefined> {
    return ipcRenderer.invoke(AppDataIPC.Get, key);
  },

  /**
   * Установить значение
   */
  set(key: string, value: unknown): Promise<void> {
    return ipcRenderer.invoke(AppDataIPC.Set, key, value);
  },

  /**
   * Удалить значение
   */
  delete(key: string): Promise<void> {
    return ipcRenderer.invoke(AppDataIPC.Delete, key);
  },

  /**
   * Обновить несколько значений
   */
  patch(patch: Record<string, unknown>): Promise<AppSettings> {
    return ipcRenderer.invoke(AppDataIPC.Patch, patch);
  },

  /**
   * Очистить все настройки
   */
  clear(): Promise<void> {
    return ipcRenderer.invoke(AppDataIPC.Clear);
  },

  /**
   * Проверить существование ключа
   */
  has(key: string): Promise<boolean> {
    return ipcRenderer.invoke(AppDataIPC.Has, key);
  },
};
