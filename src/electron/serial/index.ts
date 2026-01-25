import type { BrowserWindow } from 'electron';

import { SerialPortManager } from './port-manager';
import { setPortManager } from '../state';
import { registerGetPorts } from './register';
import { registerOpenPort } from './open';
import { registerClosePort } from './close';
import { autoConnectSerial } from './auto-connect';
import { logger } from '../logger/utils';

export function registerSerialPortIpc(win: BrowserWindow): void {
  logger.info('[Serial] Registering IPC handlers');

  // Создаём менеджер портов
  const manager = new SerialPortManager(win);
  setPortManager(manager);

  // Регистрируем IPC обработчики
  registerGetPorts(manager);
  registerOpenPort(win, manager);
  registerClosePort(manager);

  // Автоподключение после загрузки окна
  win.webContents.on('did-finish-load', () => {
    logger.info('[Serial] Window loaded, attempting auto-connect');
    autoConnectSerial(win, manager);
  });

  // Закрываем все порты при выходе
  win.on('close', async () => {
    logger.info('[Serial] Window closing, cleaning up ports');
    await manager.closeAllPorts();
  });
}
