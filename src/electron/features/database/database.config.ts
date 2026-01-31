// src/electron/features/database/database.config.ts

import { app } from 'electron';
import { join, dirname } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';

import type { DatabaseConfig, DatabaseLocation } from './database.types';
import { DEFAULT_DATABASE_CONFIG } from './database.constants';
import { logger } from '../logger';

export class DatabasePathManager {
  private config: DatabaseConfig;

  constructor(config?: Partial<DatabaseConfig>) {
    this.config = { ...DEFAULT_DATABASE_CONFIG, ...config };
  }

  /**
   * Получить путь к БД в зависимости от настроек
   */
  getPath(): string {
    const { location, customPath, filename } = this.config;

    let basePath: string;

    switch (location) {
      case 'userData':
        basePath = app.getPath('userData');
        break;

      case 'appPath':
        basePath = app.isPackaged
          ? join(dirname(app.getPath('exe')), 'database')
          : join(process.cwd(), 'database');
        break;

      case 'documents':
        basePath = join(app.getPath('documents'), 'Interrogator', 'database');
        break;

      case 'custom':
        if (customPath === undefined) {
          throw new Error('Custom path is required when location is "custom"');
        }
        basePath = customPath;
        break;

      default:
        basePath = app.getPath('userData');
    }

    this.ensureDirectoryExists(basePath);

    return join(basePath, filename);
  }

  /**
   * Создать директорию если не существует
   */
  private ensureDirectoryExists(dirPath: string): void {
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true });
      logger.info('Database', 'Created directory', { path: dirPath });
    }
  }

  /**
   * Получить информацию о всех возможных путях
   */
  getAllPossiblePaths(): Record<DatabaseLocation, string> {
    const { filename } = this.config;

    return {
      userData: join(app.getPath('userData'), filename),
      appPath: app.isPackaged
        ? join(dirname(app.getPath('exe')), 'database', filename)
        : join(process.cwd(), 'database', filename),
      documents: join(app.getPath('documents'), 'Interrogator', 'database', filename),
      custom: this.config.customPath ? join(this.config.customPath, filename) : 'Not configured',
    };
  }

  /**
   * Обновить конфигурацию
   */
  updateConfig(config: Partial<DatabaseConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Получить текущую конфигурацию
   */
  getConfig(): DatabaseConfig {
    return { ...this.config };
  }
}

// Singleton instance
let pathManager: DatabasePathManager | null = null;

export function getDatabasePathManager(): DatabasePathManager {
  if (pathManager === null) {
    pathManager = new DatabasePathManager();
  }
  return pathManager;
}

export function initializeDatabasePath(config?: Partial<DatabaseConfig>): void {
  pathManager = new DatabasePathManager(config);

  logger.info('Database', 'Path manager initialized', {
    config: pathManager.getConfig(),
    path: pathManager.getPath(),
  });
}
