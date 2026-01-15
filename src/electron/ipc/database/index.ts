import { ipcMain } from 'electron';
import { sensorDataService } from './sensor-data.service';

export function registerDatabaseIpc() {
  ipcMain.handle('db:getDataByTimeRange', async (_, port: string, startTime: number, endTime: number, limit?: number) => {
    return await sensorDataService.getDataByTimeRange(port, startTime, endTime, limit);
  });

  ipcMain.handle('db:getLastRecords', async (_, port: string, limit?: number) => {
    return await sensorDataService.getLastRecords(port, limit);
  });

  ipcMain.handle('db:getChannelStats', async (_, port: string, channel: number, startTime: number, endTime: number) => {
    return await sensorDataService.getChannelStats(port, channel, startTime, endTime);
  });

  ipcMain.handle('db:getActiveSession', async (_, port: string) => {
    return null;
  });
}
