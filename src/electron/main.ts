import { app, BrowserWindow } from 'electron';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

import { registerIpc } from './ipc';
import { appStorage } from './storage/app-storage';
import { registerDatabaseIpc } from './database/ipc/database.ipc';
import { initDatabase, saveDatabase } from './database/db';
import { registerSerialPortIpc } from './serial';
import { getPortManager } from './state';

let win: BrowserWindow | null = null;
const isDev = !app.isPackaged;

console.log('[Main] =================================');
console.log('[Main] Environment:', isDev ? 'DEVELOPMENT' : 'PRODUCTION');
console.log('[Main] app.isPackaged:', app.isPackaged);
console.log('[Main] __dirname:', __dirname);
console.log('[Main] process.cwd():', process.cwd());
console.log('[Main] app.getAppPath():', app.getAppPath());
console.log('[Main] =================================');

/**
 * Инициализация хранилища при первом запуске
 */
function initAppStorage() {
  const isFirstLaunch = appStorage.get<boolean>('isFirstLaunch');

  if (isFirstLaunch === undefined) {
    console.log('[Main] First app launch detected');

    appStorage.patch({
      isFirstLaunch: true,
      theme: 'system',
      language: 'ru',
      baudRate: 115200,
      autoConnect: false,
    });
  }
}

/**
 * Получение URL для загрузки приложения
 */
function getAppUrl(): string {
  if (isDev) {
    // Development: localhost
    return 'http://localhost:3000';
  }

  // Production: ищем HTML файл
  const possiblePaths = [
    join(__dirname, '../renderer/index.html'),
    join(process.resourcesPath, 'app.asar', 'build', 'renderer', 'index.html'),
    join(process.resourcesPath, 'build', 'renderer', 'index.html'),
    join(app.getAppPath(), 'build', 'renderer', 'index.html'),
  ];

  for (const htmlPath of possiblePaths) {
    console.log('[Main] Checking path:', htmlPath);
    if (existsSync(htmlPath)) {
      console.log('[Main] ✅ Found HTML at:', htmlPath);
      return `file://${htmlPath}`;
    }
  }

  // Fallback - используем первый путь и надеемся на лучшее
  console.error('[Main] ❌ HTML file not found in any location!');
  console.error('[Main] Using fallback path...');
  return `file://${possiblePaths[0]}`;
}

/**
 * Создание главного окна приложения
 */
async function createWindow() {
  try {
    console.log('[Main] Creating main window...');

    // 1. Инициализируем базу данных
    console.log('[Main] Initializing database...');
    await initDatabase({
      location: 'userData',
    });
    console.log('[Main] ✅ Database initialized');

    // 2. Создаём окно
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

    // 3. Регистрируем IPC обработчики
    console.log('[Main] Registering IPC handlers...');
    registerDatabaseIpc();
    registerSerialPortIpc(win);
    registerIpc(win);
    console.log('[Main] ✅ IPC handlers registered');

    // 4. Получаем URL для загрузки
    const url = getAppUrl();
    console.log('[Main] Loading URL:', url);

    // 5. Загружаем UI
    await win.loadURL(url);

    // 6. Открываем DevTools (для отладки production)
    if (isDev) {
      win.webContents.openDevTools({ mode: 'right' });
    } else {
      // В production открываем detached (отдельное окно)
      win.webContents.openDevTools({ mode: 'detach' });
    }

    // 7. Показываем окно после загрузки
    win.once('ready-to-show', () => {
      console.log('[Main] ✅ Window ready to show');
      win?.show();
    });

    // 8. Обработка ошибок загрузки
    win.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
      console.error('[Main] ❌ Failed to load:', errorCode, errorDescription);
      console.error('[Main] URL was:', validatedURL);
    });

    // 9. Перенаправляем console.log из renderer в main
    win.webContents.on('console-message', (event, level, message, line, sourceId) => {
      console.log(`[Renderer] ${message}`);
    });

    // 10. Обработка закрытия окна
    win.on('close', async (event) => {
      console.log('[Main] Window closing...');
      event.preventDefault();

      try {
        const portManager = getPortManager();
        await portManager.closeAllPorts();
        console.log('[Main] ✅ All ports closed');

        saveDatabase();
        console.log('[Main] ✅ Database saved');
      } catch (err) {
        console.error('[Main] ❌ Error during cleanup:', err);
      } finally {
        win?.destroy();
        win = null;
      }
    });

    console.log('[Main] ✅ Main window created successfully');
  } catch (err) {
    console.error('[Main] ❌ Error creating window:', err);
    throw err;
  }
}

/**
 * Инициализация приложения
 */
app.whenReady().then(async () => {
  console.log('[Main] 🚀 App ready');
  
  try {
    initAppStorage();
    await createWindow();
    console.log('[Main] ✅ Application started successfully');
  } catch (err) {
    console.error('[Main] ❌ Failed to start application:', err);
    app.quit();
  }
});

/**
 * Активация на macOS
 */
app.on('activate', () => {
  console.log('[Main] App activated');
  
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

/**
 * Перед выходом из приложения
 */
app.on('before-quit', async (event) => {
  console.log('[Main] 🛑 App quitting...');
  event.preventDefault();

  try {
    try {
      const portManager = getPortManager();
      await portManager.closeAllPorts();
      console.log('[Main] ✅ All serial ports closed');
    } catch (err) {
      console.warn('[Main] ⚠️ PortManager error:', err);
    }

    try {
      saveDatabase();
      console.log('[Main] ✅ Database saved');
    } catch (err) {
      console.error('[Main] ❌ Error saving database:', err);
    }

    console.log('[Main] ✅ Cleanup completed');
  } catch (err) {
    console.error('[Main] ❌ Error during quit cleanup:', err);
  } finally {
    app.exit(0);
  }
});

/**
 * Закрытие всех окон
 */
app.on('window-all-closed', () => {
  console.log('[Main] All windows closed');

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * Обработка необработанных ошибок
 */
process.on('uncaughtException', (err) => {
  console.error('[Main] 💥 Uncaught Exception:', err);
  try {
    saveDatabase();
  } catch (saveErr) {
    console.error('[Main] Error saving DB on crash:', saveErr);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Main] 💥 Unhandled Rejection at:', promise, 'reason:', reason);
});
