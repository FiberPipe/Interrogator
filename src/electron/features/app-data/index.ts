// src/electron/features/app-data/index.ts

export * from './app-data';
export * from './app-data.types';
export * from './app-data.constants';
export * from './app-data.api';
export * from './app-data.ipc';

export { appDataStorage } from './app-data';
export { registerAppDataIpc } from './app-data.ipc';
export { appDataAPI } from './app-data.api';
