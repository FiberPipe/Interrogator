import { saveDatabase } from '../../features/database/db';
import { logger } from '../../features/logger';
import { getPortManager } from '../state';

export async function cleanupApp() {
  try {
    await getPortManager().closeAllPorts();
    saveDatabase();
    await logger.shutdown();
  } catch (err) {
    logger.error('[Cleanup] ' + String(err));
  }
}
