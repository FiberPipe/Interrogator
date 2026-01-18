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

console.log(
  '[Main] Preload path exists:',
  existsSync(join(__dirname, 'preload.js')),
  join(__dirname, 'preload.js'),
);

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
 * Создание главного окна приложения
 */
async function createWindow() {
  try {
    console.log('[Main] Creating main window...');

    // 1. Инициализируем базу данных
    console.log('[Main] Initializing database...');
    await initDatabase({
      location: 'appPath', // или 'userData'
    });
    console.log('[Main] ✅ Database initialized');

    // 2. Создаём окно
    win = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1024,
      minHeight: 768,
      show: false, // Покажем после загрузки
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
    registerSerialPortIpc(win); // Создаёт PortManager внутри
    registerIpc(win);
    console.log('[Main] ✅ IPC handlers registered');

    // 4. Загружаем UI
    const url = process.env.NODE_ENV === 'production'
      ? `file://${join(__dirname, '../renderer/index.html')}`
      : 'http://localhost:3000';

    console.log('[Main] Loading URL:', url);
    await win.loadURL(url);

    // 5. Показываем окно после загрузки
    win.once('ready-to-show', () => {
      console.log('[Main] ✅ Window ready to show');
      win?.show();
    });

    // 6. DevTools в разработке
    if (process.env.NODE_ENV !== 'production') {
      win.webContents.openDevTools({ mode: 'right' });
    }

    // 7. Обработка закрытия окна
    win.on('close', async (event) => {
      console.log('[Main] Window closing...');
      
      // Предотвращаем закрытие до завершения очистки
      event.preventDefault();

      try {
        // Закрываем все порты
        const portManager = getPortManager();
        await portManager.closeAllPorts();
        console.log('[Main] ✅ All ports closed');

        // Сохраняем БД
        saveDatabase();
        console.log('[Main] ✅ Database saved');
      } catch (err) {
        console.error('[Main] ❌ Error during cleanup:', err);
      } finally {
        // Теперь можно закрыть окно
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
  
  // Предотвращаем выход до завершения очистки
  event.preventDefault();

  try {
    // Закрываем все порты через менеджер
    try {
      const portManager = getPortManager();
      await portManager.closeAllPorts();
      console.log('[Main] ✅ All serial ports closed');
    } catch (err) {
      console.warn('[Main] ⚠️ PortManager not available or error closing ports:', err);
    }

    // Сохраняем базу данных
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
    // Теперь можно выйти
    app.exit(0);
  }
});

/**
 * Закрытие всех окон
 */
app.on('window-all-closed', () => {
  console.log('[Main] All windows closed');

  // На macOS приложения обычно остаются активными
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * Обработка необработанных ошибок
 */
process.on('uncaughtException', (err) => {
  console.error('[Main] 💥 Uncaught Exception:', err);
  // Сохраняем БД перед выходом
  try {
    saveDatabase();
  } catch (saveErr) {
    console.error('[Main] Error saving DB on crash:', saveErr);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Main] 💥 Unhandled Rejection at:', promise, 'reason:', reason);
});
