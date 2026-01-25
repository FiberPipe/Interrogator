import { ipcRenderer } from 'electron';

export const rendererLogger = {
  debug: (msg: string) => ipcRenderer.send('log-debug', msg),
  info: (msg: string) => ipcRenderer.send('log-info', msg),
  warn: (msg: string) => ipcRenderer.send('log-warn', msg),
  error: (msg: string) => ipcRenderer.send('log-error', msg),
};
