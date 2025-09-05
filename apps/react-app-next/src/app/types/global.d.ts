export interface FilePaths {
  sensorDataFilePath?: string;
  [key: string]: string | undefined;
}

export interface UserSettings {
  theme: "light" | "dark";
  language: "ru" | "en";
}

export interface GrpcApi {
  listBdiModules: () => Promise<any[]>;
  listDrivers: () => Promise<any[]>;
  listTestSources: () => Promise<any[]>;
}


export declare global {
  interface Window {
    electron: {
      // базовые методы
      send: (channel: string, text: string) => void;
      subscribe: (channel: string, listener: Listener) => void;

      // работа с файлами
      selectFile: () => Promise<string>;
      getSensorsData: (path: string) => Promise<ChartInputData[]>;
      getFilePaths: () => Promise<FilePaths>;
      setFilePaths: (filePaths: FilePaths) => Promise<FilePaths>;
      getInputs: () => Promise<Record<string, string>>;
      insertInput: (key: string, value: string) => Promise<void>;
    };

    logger: {
      info: (msg: string) => void;
      error: (msg: string) => void;
      warn: (msg: string) => void;
      debug: (msg: string) => void;
      getFiles: () => Promise<LogFile[]>;
      readFile: (fileName: string) => Promise<string>;
    };

    grpc: GrpcApi
  }
}

export type Listener = (value: string) => void;

export type Nullable<T> = T | null;
export type Undefinable<T> = T | undefined;
