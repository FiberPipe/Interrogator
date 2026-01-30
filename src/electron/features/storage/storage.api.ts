import { ipcRenderer } from 'electron';

import type { AppDataAPI } from './storage.types';
import { AppDataChannel } from './storage.types';
import { logger } from '../logger';

export const appDataAPI: AppDataAPI = {
  getAll: (): Promise<Record<string, unknown>> => {
    logger.info('📦 getAll called');
    return ipcRenderer.invoke(AppDataChannel.GetAllAppData);
  },

  set: (key: string, value: unknown): Promise<void> => {
    logger.info(`💾 set called: ${key}=${JSON.stringify(value)}`);
    return ipcRenderer.invoke(AppDataChannel.SetAppData, key, value);
  },

  delete: (key: string): Promise<void> => {
    logger.info(`🗑️ delete called: ${key}`);
    return ipcRenderer.invoke(AppDataChannel.DeleteAppData, key);
  },

  patch: (patch: Record<string, unknown>): Promise<void> => {
    logger.info(`🔧 patch called: ${JSON.stringify(patch)}`);
    return ipcRenderer.invoke(AppDataChannel.PatchAppData, patch);
  },
  get: (key: string): Promise<string | undefined> => {
    logger.info(`🔧 get called: ${JSON.stringify(key)}`);
    return ipcRenderer.invoke(AppDataChannel.GetAppData, key);
  },
};
