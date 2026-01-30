import Store from 'electron-store';

export type AppSettings = {
  lastPort?: string;
  baudRate?: number;
} & Record<string, unknown>;

const store = new Store<AppSettings>();

export const appStorage = {
  get: <T = unknown>(key: string): T | undefined => store.get(key) as T | undefined,

  set: (key: string, value: unknown) => {
    store.set(key, value);
  },

  delete: (key: string) => {
    store.delete(key);
  },

  getAll: (): AppSettings => store.store as AppSettings,

  patch: (patch: Record<string, unknown>) => {
    Object.entries(patch).forEach(([k, v]) => store.set(k, v));
    return { ...store.store, ...patch } as AppSettings;
  },
};
