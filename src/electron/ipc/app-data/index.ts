import { ipcMain } from 'electron';

import { appStorage } from '../../storage/app-storage';

export enum AppDataChannel {
  GetAllAppData = 'app-data:get-all',
  GetAppData = 'app-data:get',
  SetAppData = 'app-data:set',
  DeleteAppData = 'app-data:delete',
  PatchAppData = 'app-data:patch',
}

export function registerAppDataIpc() {
  ipcMain.handle(AppDataChannel.GetAllAppData, () => {
    return appStorage.getAll();
  });
  ipcMain.handle(AppDataChannel.GetAppData, (_, key: string) => {
    return appStorage.get(key);
  });

  ipcMain.handle(AppDataChannel.SetAppData, (_, key: string, value: unknown) => {
    appStorage.set(key, value);
    return true;
  });

  ipcMain.handle(AppDataChannel.DeleteAppData, (_, key: string) => {
    appStorage.delete(key);
    return true;
  });

  ipcMain.handle(AppDataChannel.PatchAppData, (_, patch: Record<string, unknown>) => {
    return appStorage.patch(patch);
  });
}
