import type { BrowserWindow } from 'electron';

import { SerialPortManager } from './port-manager';
import { setPortManager } from '../state';
import { registerGetPorts } from './register';
import { registerOpenPort } from './open';
import { registerClosePort } from './close';
import { autoConnectSerial } from './auto-connect';

export function registerSerialPortIpc(win: BrowserWindow): void {
  console.log('[Serial] Registering IPC handlers');

  // Создаём менеджер портов
  const manager = new SerialPortManager(win);
  setPortManager(manager);

  // Регистрируем IPC обработчики
  registerGetPorts(manager);
  registerOpenPort(win, manager);
  registerClosePort(manager);

  // Автоподключение после загрузки окна
  win.webContents.on('did-finish-load', () => {
    console.log('[Serial] Window loaded, attempting auto-connect');
    autoConnectSerial(win, manager);
  });

  // Закрываем все порты при выходе
  win.on('close', async () => {
    console.log('[Serial] Window closing, cleaning up ports');
    await manager.closeAllPorts();
  });
}
