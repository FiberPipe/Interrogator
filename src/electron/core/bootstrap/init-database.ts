// src/electron/core/bootstrap/init-database.ts

import { database } from '../../features/database';
import { logger } from '../../features/logger';

export async function initAppDatabase(): Promise<void> {
  return logger.withLogging('App', 'Initialize database', async () => {
    await database.initialize({ location: 'userData' });
  });
}
