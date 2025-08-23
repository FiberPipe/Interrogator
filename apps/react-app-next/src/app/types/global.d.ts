export interface FilePaths {
  sensorDataFilePath?: string;
  [key: string]: string | undefined;
}

export declare global {
  interface Window {
    electron: {
      send: (channel: string, text: string) => void;
      subscribe: (channel: string, listener: Listener) => void;
      selectFile: () => Promise<string>;
      getSensorsData: (path: string) => Promise<ChartInputData[]>;
      getFilePaths: () => Promise<FilePaths>;
      setFilePaths: (filePaths: FilePaths) => Promise<FilePaths>;
    };

    logger: {
      info: (msg: string) => void;
      error: (msg: string) => void;
      warn: (msg: string) => void;
      debug: (msg: string) => void;
      getFiles: () => Promise<LogFile[]>;
      readFile: (fileName: string) => Promise<string>;
    };
  }
}

export type Listener = (value: string) => void;

export type Nullable<T> = T | null;
export type Undefinable<T> = T | undefined;