// src/electron/core/bootstrap/log-env.ts

import { app } from 'electron';

import { ENV } from '../env';
import { logger } from '../../features/logger';

export function logEnvConfig(): void {
  logger.info('App', '================================');
  logger.info('App', 'Environment Configuration', {
    isPackaged: app.isPackaged,
    nodeEnv: ENV.NODE_ENV,
    dirname: __dirname,
    cwd: process.cwd(),
    appPath: app.getAppPath(),
    resourcesPath: process.resourcesPath,
  });
  logger.info('App', '================================');
}
