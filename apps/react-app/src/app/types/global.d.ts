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

export interface FilePaths {
  sensorDataFilePath?: string;
  pythonScript1Path?: string;
  pythonScript2Path?: string;
  [key: string]: string | undefined;
}

export interface ScriptStatus {
  isRunning: boolean;
  output?: string;
  error?: string;
  pid?: number;
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
      runPythonScript: (scriptPath: string, args?: string[]) => Promise<{ pid: number }>;
      getScriptStatus: (pid: number) => Promise<ScriptStatus>;
      killScript: (pid: number) => Promise<boolean>;
      onScriptOutput: (callback: (data: { pid: number; output: string }) => void) => void;
      onScriptError: (callback: (data: { pid: number; error: string }) => void) => void;
      onScriptExit: (callback: (data: { pid: number; code: number }) => void) => void;
      checkPython: () => Promise<{ 
        available: boolean; 
        version?: string; 
        command?: string;
      }>;
    };
  }
}