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
  disconnecting: boolean;
  error: string | null;
  autoConnect: boolean;
  loadPorts: () => Promise<void>;
  handlePortChange: (port: string) => void;
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
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoConnect, setAutoConnectState] = useState(false);

  const unsubscribeErrorRef = useRef<(() => void) | null>(null);
  const unsubscribeClosedRef = useRef<(() => void) | null>(null);
  const isInitializedRef = useRef(false);
  const isMountedRef = useRef(true);

  // Загрузка списка портов
  const loadPorts = useCallback(async () => {
    console.log('[useComPort] 📡 Loading ports...');

    if (!isMountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const list = await window.serial.getPorts();
      console.log('[useComPort] ✅ Ports loaded:', list);

      if (!isMountedRef.current) return;

      setPorts(list);

      // Синхронизируем состояние подключения
      if (connectedPort) {
        const connectedPortInfo = list.find((p) => p.path === connectedPort);

        if (!connectedPortInfo) {
          // Порт отключен физически
          console.log('[useComPort] Connected port no longer exists');
          setConnectedPort(null);
        } else if (!connectedPortInfo.busy) {
          // Порт существует, но не занят - значит отключился
          console.log('[useComPort] Connected port is no longer busy');
          setConnectedPort(null);
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('[useComPort] ❌ Error loading ports:', err);

      if (isMountedRef.current) {
        setError(errorMsg);
        addDangerToaster('Ошибка получения портов', errorMsg);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [connectedPort]);

  // Инициализация
  useEffect(() => {
    if (isInitializedRef.current) return;

    console.log('[useComPort] 🔄 Initializing...');
    isInitializedRef.current = true;

    const initialize = async () => {
      try {
        const savedData = await window.appData.getAll();
        console.log('[useComPort] Saved data:', savedData);

        if (!isMountedRef.current) return;

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

  // Обработчик изменения выбранного порта
  const handlePortChange = useCallback((port: string) => {
    console.log('[useComPort] 🔄 Changing selected port to:', port);
    setSelectedPort(port);

    window.appData.set('selectedPort', port).catch((err) => {
      console.error('[useComPort] ❌ Error saving port:', err);
    });
  }, []);

  // Автосохранение
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

  // Подключение к порту
  const connectToPort = useCallback(
    async (port: string, baudRate = 115200): Promise<boolean> => {
      console.log('[useComPort] 🔌 Connecting to:', port);

      setConnecting(true);
      setError(null);

      try {
        const result: SerialOpenResult = await window.serial.open(port, baudRate);
        console.log('[useComPort] Connection result:', result);

        if (!isMountedRef.current) return false;

        if (result.error) {
          setError(result.error);
          addDangerToaster('Ошибка подключения', result.error);
          return false;
        }

        if (!result.ok) {
          const errorMsg = 'Неизвестная ошибка подключения';
          setError(errorMsg);
          addDangerToaster('Ошибка подключения', errorMsg);
          return false;
        }

        // Успешное подключение
        setConnectedPort(port);
        setSelectedPort(port);
        addSuccessToaster('Подключено', `Успешно подключено к ${port}`);

        // Обновляем список портов
        await loadPorts();

        return true;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);

        if (isMountedRef.current) {
          setError(errorMsg);
          addDangerToaster('Ошибка подключения', errorMsg);
        }

        return false;
      } finally {
        if (isMountedRef.current) {
          setConnecting(false);
        }
      }
    },
    [loadPorts],
  );

  // Отключение от порта
  const disconnectPort = useCallback(async () => {
    if (!connectedPort) {
      console.log('[useComPort] No port to disconnect');
      return;
    }

    console.log('[useComPort] 🔌 Disconnecting from:', connectedPort);

    setDisconnecting(true);
    setError(null);

    try {
      const result: SerialOpenResult = await window.serial.close(connectedPort);
      console.log('[useComPort] Disconnect result:', result);

      if (!isMountedRef.current) return;

      if (result.error) {
        addDangerToaster('Ошибка отключения', result.error);
        setError(result.error);
      } else {
        addSuccessToaster('Отключено', `Порт ${connectedPort} закрыт`);
        setConnectedPort(null);
      }

      // Обновляем список портов
      await loadPorts();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('[useComPort] ❌ Disconnect error:', err);

      if (isMountedRef.current) {
        addDangerToaster('Ошибка отключения', errorMsg);
        setError(errorMsg);
      }
    } finally {
      if (isMountedRef.current) {
        setDisconnecting(false);
      }
    }
  }, [connectedPort, loadPorts]);

  // Подписка на события портов
  useEffect(() => {
    console.log('[useComPort] 🎧 Setting up event listeners');

    const handleClosed = (port: string) => {
      console.log('[useComPort] 🔴 Port closed event:', port);

      if (port === connectedPort && isMountedRef.current) {
        setConnectedPort(null);
        addDangerToaster('Порт закрыт', `Соединение с ${port} разорвано`);
        loadPorts(); // Обновляем список
      }
    };

    const handleError = (data: { port: string; error: string }) => {
      console.error('[useComPort] ❌ Port error:', data);

      if (data.port === connectedPort && isMountedRef.current) {
        setError(data.error);
        setConnectedPort(null);
        addDangerToaster('Ошибка порта', data.error);
        loadPorts(); // Обновляем список
      }
    };

    unsubscribeClosedRef.current = window.serial.onClosed(handleClosed);
    unsubscribeErrorRef.current = window.serial.onError(handleError);

    return () => {
      console.log('[useComPort] 🧹 Cleaning up event listeners');
      if (unsubscribeClosedRef.current) unsubscribeClosedRef.current();
      if (unsubscribeErrorRef.current) unsubscribeErrorRef.current();
    };
  }, [connectedPort, loadPorts]);

  // Cleanup при размонтировании
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      console.log('[useComPort] 🧹 Component unmounting');
      isMountedRef.current = false;
    };
  }, []);

  return {
    ports,
    selectedPort,
    connectedPort,
    loading,
    connecting,
    disconnecting,
    error,
    autoConnect,
    loadPorts,
    handlePortChange,
    connectToPort,
    disconnectPort,
    setAutoConnect,
  };
};
