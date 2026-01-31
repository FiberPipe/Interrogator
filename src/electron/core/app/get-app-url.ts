// src/electron/core/app/get-app-url.ts

import { app } from 'electron';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

import { ENV } from '../env';
import { logger } from '../../features/logger';

export function getAppUrl(): string {
  return logger.withLoggingSync('App', 'Get app URL', () => {
    if (ENV.NODE_ENV === 'development') {
      logger.info('App', 'Using development server', { url: 'http://localhost:3000' });
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
        const url = pathToFileURL(htmlPath).href;
        logger.info('App', 'Using production HTML', { path: htmlPath, url });
        return url;
      }
    }

    const fallbackPath = possiblePaths[0];
    const fallbackUrl = pathToFileURL(fallbackPath).href;

    logger.warn('App', 'No HTML file found, using fallback', {
      path: fallbackPath,
      url: fallbackUrl,
    });

    return fallbackUrl;
  });
}
