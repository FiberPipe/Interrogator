import { ipcMain } from "electron";
import { SerialPort } from "serialport";
import { activePorts } from "../../state";

export function registerGetPorts() {
  ipcMain.handle("serial:getPorts", async () => {
    const ports = await SerialPort.list();

    return ports.map((p) => ({
      path: p.path,
      manufacturer: p.manufacturer,
      serialNumber: p.serialNumber,
      vendorId: p.vendorId,
      productId: p.productId,
      busy: activePorts.has(p.path),
    }));
  });
}
