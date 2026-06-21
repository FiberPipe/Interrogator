// src/electron/features/app-data/app-data.types.ts

import type { AppSettings } from '../../../shared/types/app-data.types';

export enum AppDataIPC {
  GetAll = 'app-data:get-all',
  Get = 'app-data:get',
  Set = 'app-data:set',
  Delete = 'app-data:delete',
  Patch = 'app-data:patch',
  Clear = 'app-data:clear',
  Has = 'app-data:has',
}

export interface IAppDataStorage {
  get<T = unknown>(key: string): T | undefined;
  set(key: string, value: unknown): void;
  delete(key: string): void;
  getAll(): AppSettings;
  patch(patch: Record<string, unknown>): AppSettings;
  clear(): void;
  has(key: string): boolean;
}

export interface AppDataStorageConfig {
  name?: string;
  encryptionKey?: string;
  defaults?: Partial<AppSettings>;
}
