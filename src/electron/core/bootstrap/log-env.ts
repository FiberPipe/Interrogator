import { app } from 'electron';

import { ENV } from '../env';
import { logger } from '../../logger/utils';

export function logEnvConfig() {
  logger.info('[Main] =================================');
  logger.info(`[Main] app.isPackaged: ${app.isPackaged}`);
  logger.info(`[Main] NODE_ENV: ${ENV.NODE_ENV}`);
  logger.info(`[Main] __dirname: ${__dirname}`);
  logger.info(`[Main] process.cwd(): ${process.cwd()}`);
  logger.info(`[Main] app.getAppPath(): ${app.getAppPath()}`);
  logger.info(`[Main] process.resourcesPath: ${process.resourcesPath}`);
  logger.info('[Main] =================================');
}
