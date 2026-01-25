import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';

import { useComPort } from '../../features/onboarding/model/useComport';

interface SerialPortContextValue {
  ports: any[];
  selectedPort: string | null;
  connectedPort: string | null;
  loading: boolean;
  connecting: boolean;
  disconnecting: boolean;
  error: string | null;
  autoConnect: boolean;
  loadPorts: () => Promise<void>;
  handlePortChange: (port: string) => void;
  connectToPort: (port: string, baudRate?: number) => Promise<boolean>;
  disconnectPort: () => Promise<void>;
  setAutoConnect: (value: boolean) => void;
}

const SerialPortContext = createContext<SerialPortContextValue | null>(null);

export const SerialPortProvider = ({ children }: { children: ReactNode }) => {
  const serialPort = useComPort();

  return <SerialPortContext.Provider value={serialPort}>{children}</SerialPortContext.Provider>;
};

export const useSerialPortContext = () => {
  const context = useContext(SerialPortContext);

  if (!context) {
    throw new Error('useSerialPortContext must be used within SerialPortProvider');
  }

  return context;
};
