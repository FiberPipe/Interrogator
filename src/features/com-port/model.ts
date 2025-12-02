export type SerialPortInfo = { path: string; friendlyName?: string };

export const getPorts = async (): Promise<SerialPortInfo[]> => {
  return await window.serial.getPorts();
};
