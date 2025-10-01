export type Listener = (value: any) => void;

export interface FilePaths {
  sensorDataFilePath?: string;
  pythonScript1Path?: string;
  pythonScript2Path?: string;
  [key: string]: string | undefined;
}

export type PowerFields = {
  [key: `P${number}`]: number | undefined;
};

export type StdDevFields = {
  [key: `stdDev${number}`]: number | undefined;
};

export type WavelengthFields = {
  [key: `wavelength${number}`]: number | undefined;
};

export type BaseFields = {
  id_record: number;
  time: string;
};

export type ReceivedData = BaseFields & PowerFields & StdDevFields & WavelengthFields;

export interface ScriptStatus {
  isRunning: boolean;
  output?: string;
  error?: string;
  pid?: number;
}

type Method = "Analytical" | "ML";

export interface SerialPortInfo {
  path: string;
  manufacturer?: string;
  serialNumber?: string;
  vendorId?: string;
  productId?: string;
}

declare global {
  interface Window {
    electron: {
      // базовые IPC-helpers
      send: (channel: string, ...args: any[]) => void;

      // совместимость с текущим кодом
      subscribe: (channel: string, listener: Listener) => (...args: any[]) => void;
      unsubscribe: (channel: string, listener: (...args: any[]) => void) => void;

      // доменные вызовы
      getSensorsData: (path: string) => Promise<ReceivedData[]>;
      getInputs: () => Promise<Record<string, string>>;
      insertInput: (key: string, value: string) => Promise<void>;

      selectFile: () => Promise<string | undefined>;
      getFilePaths: () => Promise<FilePaths>;
      setFilePaths: (filePaths: FilePaths) => Promise<FilePaths>;

      runPythonScript: (args?: string[]) => Promise<any>;
      listSerialPorts: () => Promise<SerialPortInfo[]>;

      startSensorCollector: (filePath: string) => void;

      // методы выбора способа вычисления λ
      getPredictionMethods: () => Promise<Record<string, Method>>;
      setPredictionMethod: (
        sensorIndex: number,
        method: Method
      ) => Promise<Record<string, Method>>;

      // очистка JSON
      clearJson: (filePath?: string) => Promise<boolean>;

      // удобные подписки с авто-отпиской
      onFilePathsUpdated: (cb: (paths: FilePaths) => void) => () => void;
      onDataFileCleared: (cb: (path: string) => void) => () => void;
      onPredictionMethodsUpdated: (
        cb: (pm: Record<string, Method>) => void
      ) => () => void;
    };
  }
}

export { };
