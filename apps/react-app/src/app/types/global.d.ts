declare module "*.module.css" {
  const content: Record<string, string>;
  export default content;
}

export type Listener = (value: string) => void;

export interface FilePaths {
  sensorDataFilePath?: string;
  [key: string]: string | undefined;
}

export interface TData {
  [key: string]: any;
}

export declare global {
  interface Window {
    electron: {
      send: (channel: string, text: string) => void;
      subscribe: (channel: string, listener: Listener) => void;
      getSensorsData: (path: string) => Promise<TData[]>;
      getInputs: () => Promise<{ [key: string]: string }>;
      insertInput: (key: string, value: string) => Promise<boolean>;
      selectFile: () => Promise<string>;
      getFilePaths: () => Promise<FilePaths>;
      setFilePaths: (filePaths: FilePaths) => Promise<FilePaths>;
    };
  }
}