declare module "*.module.css" {
  const content: Record<string, string>;
  export default content;
}

export type Listener = (value: string) => void;

export declare global {
  interface Window {
    electron: {
      send: (channel: string, text: string) => void;
      subscribe: (channel: string, listener: Listener) => void;
      getSensorsData: (path: string) => Promise<{ [key: string]: string }>;
      getInputs: (path: string) => Promise<{ [key: string]: string }>;
      insertInput: (key: string, value: string, path: string) => Promise<boolean>;
      selectFile: () => Promise<string>;
    };
  }
}
