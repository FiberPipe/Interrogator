import { ipcMain } from "electron";
import { BrowserWindow } from "electron";
import { ApiService } from "../api";

let apiService: ApiService | null = null;

export function initGrpcApi(window: BrowserWindow) {
  apiService = new ApiService(window);

  ipcMain.handle("grpc:listBdiModules", async () => {
    if (!apiService) return [];
    return await apiService.listBdiModules();
  });

  ipcMain.handle("grpc:listDrivers", async () => {
    if (!apiService) return [];
    return await apiService.listDrivers();
  });

  ipcMain.handle("grpc:listTestSources", async () => {
    if (!apiService) return [];
    return await apiService.listTestSources();
  });
}
