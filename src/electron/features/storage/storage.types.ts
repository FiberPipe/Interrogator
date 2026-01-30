export enum AppDataChannel {
  GetAllAppData = 'app-data:get-all',
  GetAppData = 'app-data:get',
  SetAppData = 'app-data:set',
  DeleteAppData = 'app-data:delete',
  PatchAppData = 'app-data:patch',
}

export interface AppDataAPI {
  getAll(): Promise<Record<string, unknown>>;
  set(key: string, value: unknown): Promise<void>;
  delete(key: string): Promise<void>;
  patch(patch: Record<string, unknown>): Promise<void>;
  get(key: string): Promise<string | undefined>;
}
