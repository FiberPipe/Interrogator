import { initDatabase } from '../../features/database/db';

export async function initAppDatabase() {
  await initDatabase({ location: 'userData' });
}
