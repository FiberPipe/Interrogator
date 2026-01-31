// src/electron/core/register-ipc.ts

import type { BrowserWindow } from 'electron';

import { registerDatabaseIpc } from '../features/database';
import { registerLoggerIpc } from '../features/logger';
import { registerAppDataIpc } from '../features/app-data';
import { logger } from '../features/logger';
import { createSerialManager } from '../features/serial/serial';
import { setPortManager } from './state';

export function registerIpcHandlers(win: BrowserWindow): void {
    logger.info('IPC', 'Registering all IPC handlers');

    // App Data
    registerAppDataIpc();

    // Logger
    registerLoggerIpc();

    // Database
    registerDatabaseIpc();

    // Serial
    const serialManager = createSerialManager(win);
    serialManager.initialize();
    setPortManager(serialManager.getPortManager());

    logger.info('IPC', 'All IPC handlers registered successfully');
}