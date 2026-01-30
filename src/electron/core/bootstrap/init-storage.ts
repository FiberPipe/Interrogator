import { logger } from '../../logger/utils';
import { appStorage } from '../../features/storage/storage';

export function initAppStorage() {
  if (appStorage.get('isFirstLaunch') === undefined) {
    logger.info('[Main] First app launch detected');

    appStorage.patch({
      isFirstLaunch: true,
      theme: 'system',
      language: 'ru',
      baudRate: 115200,
      autoConnect: false,
    });
  }
}
