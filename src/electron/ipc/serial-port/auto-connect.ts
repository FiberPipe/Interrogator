import { BrowserWindow } from 'electron';
import { SerialPort } from 'serialport';
import { appStorage } from '../../storage/app-storage';
import { activePorts } from '../../state';

export async function autoConnectSerial(win: BrowserWindow) {
const lastPort = appStorage.get<string>("lastPort") ?? "";
const lastBaud = appStorage.get<number>("baudRate") ?? 115200;

  if (!lastPort) {
    win.webContents.send('serial:auto-connect-none');
    return;
  }

  const ports = await SerialPort.list();
  const exists = ports.some((p) => p.path === lastPort);

  if (!exists) {
    win.webContents.send('serial:auto-connect-failed', lastPort);
    return;
  }

  try {
    const port = new SerialPort({ path: lastPort, baudRate: lastBaud });

    activePorts.set(String(lastPort), port);

    win.webContents.send('serial:auto-connected', lastPort);

    port.on('data', (data) => {
      win.webContents.send('serial:data', {
        port: lastPort,
        data: data.toString(),
      });
    });

    port.on('close', () => {
      activePorts.delete(String(lastPort));
      win.webContents.send('serial:closed', lastPort);
    });
  } catch (e) {
    win.webContents.send('serial:auto-connect-error', {
      port: lastPort,
      error: String(e),
    });
  }
}
