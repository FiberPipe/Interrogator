// app/app-url.ts
import { app } from 'electron';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

import { ENV } from '../env';
import { logger } from '../../logger/utils';

export function getAppUrl(): string {
  if (ENV.NODE_ENV) {
    logger.info('[Main] 🔧 Development mode - using localhost');
    return 'http://localhost:3000';
  }

  const possiblePaths = [
    join(__dirname, '..', 'renderer', 'index.html'),
    join(process.resourcesPath, 'app.asar', 'build', 'renderer', 'index.html'),
    join(process.resourcesPath, 'build', 'renderer', 'index.html'),
    join(app.getAppPath(), 'build', 'renderer', 'index.html'),
  ];

  for (const htmlPath of possiblePaths) {
    if (existsSync(htmlPath)) {
      return pathToFileURL(htmlPath).href;
    }
  }

  return pathToFileURL(possiblePaths[0]).href;
}
