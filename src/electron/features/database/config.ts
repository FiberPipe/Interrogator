import { app } from 'electron';
import { join, dirname } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';

import { logger } from '../logger/logger.utils';

export type DatabaseLocation = 'userData' | 'appPath' | 'documents' | 'custom';

export interface DatabaseConfig {
  location: DatabaseLocation;
  customPath?: string;
  filename: string;
}

// Дефолтная конфигурация
const defaultConfig: DatabaseConfig = {
  location: 'userData',
  filename: 'sensor-data.db',
};

export class DatabasePathManager {
  private config: DatabaseConfig;

  constructor(config?: Partial<DatabaseConfig>) {
    this.config = { ...defaultConfig, ...config };
  }

  // Получить путь к БД в зависимости от настроек
  getPath(): string {
    const { location, customPath, filename } = this.config;

    let basePath: string;

    switch (location) {
      case 'userData':
        // Стандартное расположение (AppData/Roaming на Windows)
        basePath = app.getPath('userData');
        break;

      case 'appPath':
        // Рядом с исполняемым файлом приложения
        if (app.isPackaged) {
          // В production: рядом с .exe/.app
          basePath = join(dirname(app.getPath('exe')), 'database');
        } else {
          // В development: в корне проекта
          basePath = join(process.cwd(), 'database');
        }
        break;

      case 'documents':
        // В папке Документы пользователя
        basePath = join(app.getPath('documents'), 'Interrogator', 'database');
        break;

      case 'custom':
        // Кастомный путь
        if (!customPath) {
          throw new Error('Custom path is required when location is "custom"');
        }
        basePath = customPath;
        break;

      default:
        basePath = app.getPath('userData');
    }

    // Создаём папку если её нет
    this.ensureDirectoryExists(basePath);

    return join(basePath, filename);
  }

  // Создать директорию если не существует
  private ensureDirectoryExists(dirPath: string): void {
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true });
      logger.info(`[DatabasePath] Created directory:${dirPath}`);
    }
  }

  // Получить информацию о всех возможных путях
  getAllPossiblePaths(): Record<DatabaseLocation, string> {
    return {
      userData: join(app.getPath('userData'), this.config.filename),
      appPath: app.isPackaged
        ? join(dirname(app.getPath('exe')), 'database', this.config.filename)
        : join(process.cwd(), 'database', this.config.filename),
      documents: join(app.getPath('documents'), 'Interrogator', 'database', this.config.filename),
      custom: this.config.customPath
        ? join(this.config.customPath, this.config.filename)
        : 'Not configured',
    };
  }

  // Обновить конфигурацию
  updateConfig(config: Partial<DatabaseConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // Получить текущую конфигурацию
  getConfig(): DatabaseConfig {
    return { ...this.config };
  }
}

// Singleton instance
let pathManager: DatabasePathManager | null = null;

export function getDatabasePathManager(): DatabasePathManager {
  if (!pathManager) {
    pathManager = new DatabasePathManager();
  }
  return pathManager;
}

export function initializeDatabasePath(config?: Partial<DatabaseConfig>): void {
  pathManager = new DatabasePathManager(config);
  logger.info(`[DatabasePath] Initialized with config:${pathManager.getConfig()}`);
  logger.info(`[DatabasePath] Database will be stored at:${pathManager.getPath()}`);
}
