// src/shared/utils/renderer-logger.ts

/**
 * Logger для renderer процесса
 * Отправляет логи в main процесс через window.logs API
 */

const isLogsAvailable = () => {
  return typeof window !== 'undefined' && window.logs && window.logs.send;
};

export const rendererLogger = {
  debug: (message: string, ...args: any[]) => {
    console.debug(`[Renderer] ${message}`, ...args);
    if (isLogsAvailable()) {
      window.logs.send('debug', message, ...args);
    }
  },

  info: (message: string, ...args: any[]) => {
    console.info(`[Renderer] ${message}`, ...args);
    if (isLogsAvailable()) {
      window.logs.send('info', message, ...args);
    }
  },

  warn: (message: string, ...args: any[]) => {
    console.warn(`[Renderer] ${message}`, ...args);
    if (isLogsAvailable()) {
      window.logs.send('warn', message, ...args);
    }
  },

  error: (message: string, ...args: any[]) => {
    console.error(`[Renderer] ${message}`, ...args);
    if (isLogsAvailable()) {
      window.logs.send('error', message, ...args);
    }
  },
};
