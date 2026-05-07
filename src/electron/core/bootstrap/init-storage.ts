// src/electron/core/bootstrap/init-storage.ts

import { appDataStorage } from '../../features/app-data';
import { logger } from '../../features/logger';

export function initAppStorage(): void {
  return logger.withLoggingSync('App', 'Initialize storage', () => {
    if (appDataStorage.get('isFirstLaunch') === undefined) {
      logger.info('App', 'First app launch detected');

      appDataStorage.patch({
        isFirstLaunch: true,
        theme: 'system',
        language: 'ru',
        baudRate: 500000,
        autoConnect: false,
      });
    }

    logger.info('App', 'Storage initialized', {
      storePath: appDataStorage.getStorePath(),
      size: appDataStorage.getSize(),
    });
  });
}
