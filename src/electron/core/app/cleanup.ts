// src/electron/core/app/cleanup.ts

import { database } from '../../features/database';
import { logger } from '../../features/logger';
import { getPortManager } from '../state';

export async function cleanupApp(): Promise<void> {
  return logger.withLogging('App', 'Cleanup application', async () => {
    try {
      // Закрываем порты
      await getPortManager().closeAllPorts();

      // Сохраняем БД
      await database.shutdown();

      // Завершаем логгер
      await logger.shutdown();

      logger.info('App', 'Cleanup completed successfully');
    } catch (err) {
      logger.error('App', 'Cleanup error', {}, err);
      throw err;
    }
  });
}
