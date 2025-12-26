// src/features/com-port/hooks/useComPort.ts
import { useEffect, useState, useCallback, useRef } from 'react';
import { addSuccessToaster, addDangerToaster } from '../../../shared/ui';

interface SerialOpenResult {
  ok?: boolean;
  error?: string;
}

interface SerialPortInfo {
  path: string;
  manufacturer?: string;
  serialNumber?: string;
  vendorId?: string;
  productId?: string;
  busy: boolean;
}

interface UseComPortReturn {
  ports: SerialPortInfo[];
  selectedPort: string | null;
  connectedPort: string | null;
  loading: boolean;
  connecting: boolean;
  error: string | null;
  autoConnect: boolean;
  loadPorts: () => Promise<void>;
  handlePortChange: (port: string) => Promise<void>;
  connectToPort: (port: string, baudRate?: number) => Promise<boolean>;
  disconnectPort: () => Promise<void>;
  setAutoConnect: (value: boolean) => void;
}

export const useComPort = (): UseComPortReturn => {
  const [ports, setPorts] = useState<SerialPortInfo[]>([]);
  const [selectedPort, setSelectedPort] = useState<string | null>(null);
  const [connectedPort, setConnectedPort] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoConnect, setAutoConnectState] = useState(false);

  const unsubscribeErrorRef = useRef<(() => void) | null>(null);
  const unsubscribeClosedRef = useRef<(() => void) | null>(null);
  const isInitializedRef = useRef(false);

  // Загрузка списка портов с проверкой состояния
  const loadPorts = useCallback(async () => {
    console.log('[useComPort] 📡 Loading ports...');
    setLoading(true);
    setError(null);

    try {
      const list = await window.serial.getPorts();
      console.log('[useComPort] ✅ Ports loaded:', list);

      setPorts(list);

      // Проверяем состояние выбранного порта
      if (selectedPort) {
        const selectedPortInfo = list.find((p) => p.path === selectedPort);
        
        if (!selectedPortInfo) {
          console.log('[useComPort] Selected port no longer exists');
          setConnectedPort(null);
          setSelectedPort(null);
        } else if (selectedPortInfo.busy && connectedPort !== selectedPort) {
          console.log('[useComPort] Selected port is busy');
          // Порт занят, но не нами - отключаем
          setConnectedPort(null);
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('[useComPort] ❌ Error loading ports:', err);
      setError(errorMsg);
      addDangerToaster('Ошибка получения портов', errorMsg);
    } finally {
      setLoading(false);
    }
  }, [selectedPort, connectedPort]);

  // Инициализация
  useEffect(() => {
    if (isInitializedRef.current) return;
    
    console.log('[useComPort] 🔄 Initializing...');
    isInitializedRef.current = true;

    const initialize = async () => {
      try {
        const savedData = await window.appData.getAll();
        console.log('[useComPort] Saved data:', savedData);

        if (savedData?.selectedPort && typeof savedData.selectedPort === 'string') {
          console.log('[useComPort] ✅ Setting saved port:', savedData.selectedPort);
          setSelectedPort(savedData.selectedPort);
        }

        if (savedData?.autoConnect === true) {
          console.log('[useComPort] ✅ Auto-connect enabled');
          setAutoConnectState(true);
        }

        await loadPorts();
      } catch (err) {
        console.error('[useComPort] ❌ Error during initialization:', err);
      }
    };

    initialize();
  }, [loadPorts]);

  // Проверка состояния при возврате на страницу
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('[useComPort] Page visible, checking port status...');
        loadPorts();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadPorts]);

  const handlePortChange = useCallback(async (port: string) => {
    console.log('[useComPort] 🔄 Changing port to:', port);
    setSelectedPort(port);

    try {
      await window.appData.set('selectedPort', port);
      console.log('[useComPort] ✅ Port saved');
    } catch (err) {
      console.error('[useComPort] ❌ Error saving port:', err);
    }
  }, []);

  const setAutoConnect = useCallback(async (value: boolean) => {
    console.log('[useComPort] 🔄 Setting auto-connect:', value);
    setAutoConnectState(value);

    try {
      await window.appData.set('autoConnect', value);
      console.log('[useComPort] ✅ Auto-connect saved');
    } catch (err) {
      console.error('[useComPort] ❌ Error saving auto-connect:', err);
    }
  }, []);

  const connectToPort = useCallback(
    async (port: string, baudRate = 115200): Promise<boolean> => {
      console.log('[useComPort] 🔌 Connecting to:', port);
      setConnecting(true);
      setError(null);

      try {
        if (connectedPort && connectedPort !== port) {
          console.log('[useComPort] Closing current port:', connectedPort);
          await window.serial.close(connectedPort);
        }

        const result: SerialOpenResult = await window.serial.open(port, baudRate);
        console.log('[useComPort] Result:', result);

        if (result.error) {
          setError(result.error);
          addDangerToaster('Ошибка подключения', result.error);
          return false;
        }

        if (!result.ok) {
          setError('Unknown error');
          return false;
        }

        setConnectedPort(port);
        addSuccessToaster('Подключено', `Успешно подключено к ${port}`);
        
        // Обновляем список портов для обновления статуса busy
        loadPorts();
        
        return true;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setError(errorMsg);
        addDangerToaster('Ошибка подключения', errorMsg);
        return false;
      } finally {
        setConnecting(false);
      }
    },
    [connectedPort, loadPorts]
  );

  const disconnectPort = useCallback(async () => {
    if (!connectedPort) return;

    console.log('[useComPort] 🔌 Disconnecting from:', connectedPort);

    try {
      const result = await window.serial.close(connectedPort);

      if (result.error) {
        addDangerToaster('Ошибка отключения', result.error);
        return;
      }

      setConnectedPort(null);
      addSuccessToaster('Отключено', `Порт ${connectedPort} закрыт`);
      
      // Обновляем список портов
      loadPorts();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      addDangerToaster('Ошибка отключения', errorMsg);
    }
  }, [connectedPort, loadPorts]);

  // Подписка на события портов
  useEffect(() => {
    const handleClosed = (port: string) => {
      console.log('[useComPort] 🔴 Port closed:', port);
      if (port === connectedPort) {
        setConnectedPort(null);
        addDangerToaster('Порт закрыт', `Соединение с ${port} разорвано`);
      }
    };

    const handleError = (data: { port: string; error: string }) => {
      console.error('[useComPort] ❌ Port error:', data);
      if (data.port === connectedPort) {
        setError(data.error);
        addDangerToaster('Ошибка порта', data.error);
      }
    };

    unsubscribeClosedRef.current = window.serial.onClosed(handleClosed);
    unsubscribeErrorRef.current = window.serial.onError(handleError);

    return () => {
      if (unsubscribeClosedRef.current) unsubscribeClosedRef.current();
      if (unsubscribeErrorRef.current) unsubscribeErrorRef.current();
    };
  }, [connectedPort]);

  // Отключение при закрытии приложения
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (connectedPort) {
        console.log('[useComPort] 🚪 App closing, disconnecting from:', connectedPort);
        await window.serial.close(connectedPort);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Финальная очистка при размонтировании
      if (connectedPort) {
        console.log('[useComPort] 🧹 Cleanup: disconnecting from:', connectedPort);
        window.serial.close(connectedPort);
      }
    };
  }, [connectedPort]);

  return {
    ports,
    selectedPort,
    connectedPort,
    loading,
    connecting,
    error,
    autoConnect,
    loadPorts,
    handlePortChange,
    connectToPort,
    disconnectPort,
    setAutoConnect,
  };
};
