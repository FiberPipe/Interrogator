// src/main.ts
import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

import { registerIpc } from './ipc';
import { appStorage } from './storage/app-storage';
import { registerDatabaseIpc } from './database/ipc/database.ipc';
import { initDatabase, saveDatabase } from './database/db';
import { registerSerialPortIpc } from './serial';
import { getPortManager } from './state';
import { ENV, logEnvConfig } from './env';
import { logger } from './logger/utils';

logEnvConfig();

let win: BrowserWindow | null = null;
const isDev = ENV.NODE_ENV === 'development';

logger.info('[Main] =================================');
logger.info(`[Main] app.isPackaged: ${app.isPackaged}`);
logger.info(`[Main] __dirname: ${__dirname}`);
logger.info(`[Main] process.cwd(): ${process.cwd()}`);
logger.info(`[Main] app.getAppPath(): ${app.getAppPath()}`);
logger.info('[Main] =================================');

function initAppStorage() {
  const isFirstLaunch = appStorage.get<boolean>('isFirstLaunch');

  if (isFirstLaunch === undefined) {
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

function getAppUrl(): string {
  if (isDev) {
    return 'http://localhost:3000';
  }

  const possiblePaths = [
    join(__dirname, '../renderer/index.html'),
    join(process.resourcesPath, 'app.asar', 'build', 'renderer', 'index.html'),
    join(process.resourcesPath, 'build', 'renderer', 'index.html'),
    join(app.getAppPath(), 'build', 'renderer', 'index.html'),
  ];

  for (const htmlPath of possiblePaths) {
    logger.info(`[Main] Checking path: ${htmlPath}`);
    if (existsSync(htmlPath)) {
      logger.info(`[Main] ✅ Found HTML at: ${htmlPath}`);
      return `file://${htmlPath}`;
    }
  }

  logger.error('[Main] ❌ HTML file not found in any location!');
  logger.warn('[Main] Using fallback path...');
  return `file://${possiblePaths[0]}`;
}

async function createWindow() {
  try {
    logger.info('[Main] Creating main window...');

    logger.info('[Main] Initializing database...');
    await initDatabase({ location: 'userData' });
    logger.info('[Main] ✅ Database initialized');

    win = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1024,
      minHeight: 768,
      show: false,
      webPreferences: {
        preload: join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
        devTools: true,
      },
    });

    logger.info('[Main] Registering IPC handlers...');
    registerDatabaseIpc();
    registerSerialPortIpc(win);
    registerIpc(win);
    logger.info('[Main] ✅ IPC handlers registered');

    const url = getAppUrl();
    logger.info(`[Main] Loading URL: ${url}`);
    await win.loadURL(url);

    if (isDev) {
      win.webContents.openDevTools({ mode: 'right' });
    } else {
      win.webContents.openDevTools({ mode: 'detach' });
    }

    win.once('ready-to-show', () => {
      logger.info('[Main] ✅ Window ready to show');
      win?.show();
    });

    win.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
      logger.error(`[Main] ❌ Failed to load: ${errorCode} ${errorDescription}`);
      logger.error(`[Main] URL was: ${validatedURL}`);
    });

    // Перенаправление console из renderer в main
    win.webContents.on('console-message', (event, level, message, line, sourceId) => {
      logger.info(`[Renderer] ${message} (line ${line}, source ${sourceId})`);
    });

    win.on('close', async (event) => {
      logger.info('[Main] Window closing...');
      event.preventDefault();

      try {
        const portManager = getPortManager();
        await portManager.closeAllPorts();
        logger.info('[Main] ✅ All ports closed');

        saveDatabase();
        logger.info('[Main] ✅ Database saved');
      } catch (err) {
        logger.error(
          '[Main] ❌ Error during cleanup: ' + (err instanceof Error ? err.stack : String(err)),
        );
      } finally {
        win?.destroy();
        win = null;
      }
    });

    logger.info('[Main] ✅ Main window created successfully');
  } catch (err) {
    logger.error(
      '[Main] ❌ Error creating window: ' + (err instanceof Error ? err.stack : String(err)),
    );
    throw err;
  }
}

/**
 * Инициализация приложения
 */
app.whenReady().then(async () => {
  logger.info('[Main] 🚀 App ready');

  try {
    initAppStorage();
    await createWindow();
    logger.info('[Main] ✅ Application started successfully');
  } catch (err) {
    logger.error(
      '[Main] ❌ Failed to start application: ' + (err instanceof Error ? err.stack : String(err)),
    );
    app.quit();
  }
});

/**
 * Активация на macOS
 */
app.on('activate', () => {
  logger.info('[Main] App activated');

  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

/**
 * Перед выходом из приложения
 */
app.on('before-quit', async (event) => {
  logger.info('[Main] 🛑 App quitting...');
  event.preventDefault();

  try {
    try {
      const portManager = getPortManager();
      await portManager.closeAllPorts();
      logger.info('[Main] ✅ All serial ports closed');
    } catch (err) {
      logger.warn(
        '[Main] ⚠️ PortManager error: ' + (err instanceof Error ? err.stack : String(err)),
      );
    }

    try {
      saveDatabase();
      logger.info('[Main] ✅ Database saved');
    } catch (err) {
      logger.error(
        '[Main] ❌ Error saving database: ' + (err instanceof Error ? err.stack : String(err)),
      );
    }

    logger.info('[Main] ✅ Cleanup completed');
  } catch (err) {
    logger.error(
      '[Main] ❌ Error during quit cleanup: ' + (err instanceof Error ? err.stack : String(err)),
    );
  } finally {
    app.exit(0);
  }
});

/**
 * Закрытие всех окон
 */
app.on('window-all-closed', () => {
  logger.info('[Main] All windows closed');

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * Обработка необработанных ошибок
 */
process.on('uncaughtException', (err) => {
  logger.error('[Main] 💥 Uncaught Exception: ' + (err instanceof Error ? err.stack : String(err)));
  try {
    saveDatabase();
  } catch (saveErr) {
    logger.error(
      '[Main] Error saving DB on crash: ' +
        (saveErr instanceof Error ? saveErr.stack : String(saveErr)),
    );
  }
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('[Main] 💥 Unhandled Rejection at: ' + promise + ' reason: ' + String(reason));
});

ipcMain.on('log-info', (_, msg) => logger.info('[Renderer] ' + msg));
ipcMain.on('log-warn', (_, msg) => logger.warn('[Renderer] ' + msg));
ipcMain.on('log-error', (_, msg) => logger.error('[Renderer] ' + msg));
ipcMain.on('log-debug', (_, msg) => logger.debug('[Renderer] ' + msg));
