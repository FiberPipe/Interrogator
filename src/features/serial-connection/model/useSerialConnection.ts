// src/features/serial-connection/model/useSerialConnection.ts
import { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import type {
  SerialConnectionState,
  SerialDataPacket,
} from '../../../entities/serial-port/model/types';
import { addSuccessToaster, addDangerToaster } from '../../../shared/ui';
import { serialApi } from '../../../shared/api/serial.api';
import { appDataApi } from '../../../shared/api/app-data.api';

const MAX_BUFFER_SIZE = 100;

export const useSerialConnection = () => {
  const { t } = useTranslation();
  const [state, setState] = useState<SerialConnectionState>({
    ports: [],
    selectedPort: null,
    connectedPort: null,
    loading: false,
    connecting: false,
    error: null,
    autoConnect: false,
    lastData: null,
    dataBuffer: [],
    packetsReceived: 0,
  });

  const unsubscribeDataRef = useRef<(() => void) | null>(null);
  const unsubscribeErrorRef = useRef<(() => void) | null>(null);
  const unsubscribeClosedRef = useRef<(() => void) | null>(null);
  const isInitializedRef = useRef(false);
  const isDisconnectingRef = useRef(false); // Флаг для предотвращения гонки

  // Загрузка портов
  const loadPorts = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const list = await serialApi.getPorts();
      addSuccessToaster('[useSerialConnection] Ports loaded:', String(list));

      setState((prev) => {
        const newState = { ...prev, ports: list, loading: false };

        // Проверяем состояние выбранного порта
        if (prev.selectedPort) {
          const selectedPortInfo = list.find((p) => p.path === prev.selectedPort);

          if (!selectedPortInfo) {
            addSuccessToaster('[useSerialConnection] Selected port no longer exists', '');
            newState.connectedPort = null;
            newState.selectedPort = null;
          }
        }

        return newState;
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setState((prev) => ({ ...prev, error: errorMsg, loading: false }));
      addDangerToaster(t('serialPort.alerts.error'), errorMsg);
    }
  }, [t]);

  // Выбор порта
  const handlePortChange = useCallback(
    async (port: string) => {
      addSuccessToaster('[useSerialConnection] Changing port to:', port);

      // Если уже подключены к другому порту - отключаемся
      if (state.connectedPort && state.connectedPort !== port) {
        addSuccessToaster('[useSerialConnection] Need to disconnect from current port first', '');
        isDisconnectingRef.current = true;

        try {
          await serialApi.close(state.connectedPort);
          addSuccessToaster(
            '[useSerialConnection] Successfully disconnected from:',
            state.connectedPort,
          );
        } catch (err) {
          addDangerToaster('[useSerialConnection] Error disconnecting:', String(err));
        }

        setState((prev) => ({
          ...prev,
          selectedPort: port,
          connectedPort: null,
          lastData: null,
          dataBuffer: [],
          packetsReceived: 0,
          error: null,
        }));

        isDisconnectingRef.current = false;
      } else {
        setState((prev) => ({ ...prev, selectedPort: port, error: null }));
      }

      try {
        await appDataApi.set('selectedPort', port);
        addSuccessToaster('[useSerialConnection] Port saved', '');
      } catch (err) {
        addDangerToaster('[useSerialConnection] Error saving port:', String(err));
      }
    },
    [state.connectedPort],
  );

  // Подключение к порту
  const connectToPort = useCallback(
    async (port: string, baudRate = 500000): Promise<boolean> => {
      addSuccessToaster('[useSerialConnection] Connecting to:', port);

      // Предотвращаем подключение во время отключения
      if (isDisconnectingRef.current) {
        addSuccessToaster('[useSerialConnection] Currently disconnecting, wait...', '');
        return false;
      }

      setState((prev) => ({ ...prev, connecting: true, error: null }));

      try {
        // Проверяем, не подключены ли мы уже к этому порту
        if (state.connectedPort === port) {
          addSuccessToaster('[useSerialConnection] Already connected to this port', '');
          setState((prev) => ({ ...prev, connecting: false }));
          return true;
        }

        // Отключаемся от текущего порта если есть
        if (state.connectedPort && state.connectedPort !== port) {
          addSuccessToaster('[useSerialConnection] Closing current port:', state.connectedPort);
          isDisconnectingRef.current = true;
          await serialApi.close(state.connectedPort);
          isDisconnectingRef.current = false;

          // Небольшая задержка для стабилизации
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        addSuccessToaster('[useSerialConnection] Opening port:', port);
        const result = await serialApi.open(port, baudRate);
        addSuccessToaster('[useSerialConnection] Connection result:', String(result));

        if (result.error) {
          setState((prev) => ({
            ...prev,
            error: result.error || null,
            connecting: false,
            connectedPort: null,
          }));
          addDangerToaster(t('serialPort.alerts.error'), result.error);
          return false;
        }

        if (!result.ok) {
          setState((prev) => ({
            ...prev,
            error: 'Unknown error',
            connecting: false,
            connectedPort: null,
          }));
          return false;
        }

        setState((prev) => ({
          ...prev,
          connectedPort: port,
          connecting: false,
          lastData: null,
          dataBuffer: [],
          packetsReceived: 0,
          error: null,
        }));

        addSuccessToaster(
          t('serialPort.status.connected'),
          `${t('serialPort.alerts.connectedTo')} ${port}`,
        );

        // Обновляем список портов для обновления статуса busy
        loadPorts();

        return true;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setState((prev) => ({
          ...prev,
          error: errorMsg,
          connecting: false,
          connectedPort: null,
        }));
        addDangerToaster(t('serialPort.alerts.error'), errorMsg);
        return false;
      }
    },
    [state.connectedPort, t, loadPorts],
  );

  // Отключение от порта
  const disconnectPort = useCallback(async () => {
    if (!state.connectedPort || isDisconnectingRef.current) {
      addSuccessToaster('[useSerialConnection] Already disconnecting or no port connected', '');
      return;
    }

    addSuccessToaster('[useSerialConnection] Disconnecting from:', state.connectedPort);
    isDisconnectingRef.current = true;
    const portToClose = state.connectedPort;

    try {
      const result = await serialApi.close(portToClose);

      if (result.error) {
        addDangerToaster('[useSerialConnection] Disconnect error:', result.error);
        // Не показываем ошибку если порт уже закрыт
        if (!result.error.includes('not opened')) {
          addDangerToaster(t('serialPort.alerts.error'), result.error);
        }
      } else {
        addSuccessToaster(
          t('serialPort.status.disconnected'),
          `${t('serialPort.info.path')}: ${portToClose}`,
        );
      }

      setState((prev) => ({
        ...prev,
        connectedPort: null,
        lastData: null,
        dataBuffer: [],
        packetsReceived: 0,
        error: null,
      }));

      // Обновляем список портов
      await loadPorts();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      addDangerToaster(t('serialPort.alerts.error'), errorMsg);
    } finally {
      isDisconnectingRef.current = false;
    }
  }, [state.connectedPort, t, loadPorts]);

  // Установка автоподключения
  const setAutoConnect = useCallback(async (value: boolean) => {
    addSuccessToaster('[useSerialConnection] Setting auto-connect:', String(value));
    setState((prev) => ({ ...prev, autoConnect: value }));

    try {
      await appDataApi.set('autoConnect', value);
      addSuccessToaster('[useSerialConnection] Auto-connect saved', '');
    } catch (err) {
      addDangerToaster('[useSerialConnection] Error saving auto-connect:', String(err));
    }
  }, []);

  // Инициализация
  useEffect(() => {
    if (isInitializedRef.current) return;

    addSuccessToaster('[useSerialConnection] Initializing...', '');
    isInitializedRef.current = true;

    const initialize = async () => {
      try {
        const savedData = await appDataApi.getAll();
        addSuccessToaster('[useSerialConnection] Saved data:', String(savedData));

        setState((prev) => ({
          ...prev,
          selectedPort: (savedData?.selectedPort as string) || null,
          autoConnect: (savedData?.autoConnect as boolean) || false,
        }));

        await loadPorts();
      } catch (err) {
        addDangerToaster('[useSerialConnection] Error during initialization:', String(err));
      }
    };

    initialize();
  }, [loadPorts]);

  // Автоподключение
  useEffect(() => {
    if (
      state.autoConnect &&
      state.selectedPort &&
      !state.connectedPort &&
      !state.connecting &&
      !isDisconnectingRef.current &&
      state.ports.length > 0
    ) {
      // Проверяем что выбранный порт доступен
      const portExists = state.ports.some((p) => p.path === state.selectedPort);

      if (portExists) {
        addSuccessToaster('[useSerialConnection] Auto-connecting to:', state.selectedPort);
        connectToPort(state.selectedPort);
      } else {
        addSuccessToaster('[useSerialConnection] Selected port not available for auto-connect', '');
      }
    }
  }, [
    state.autoConnect,
    state.selectedPort,
    state.connectedPort,
    state.connecting,
    state.ports,
    connectToPort,
  ]);

  // Подписка на данные
  useEffect(() => {
    addSuccessToaster('[useSerialConnection] Setting up data listener', '');

    const handleData = (event: { port: string; data: string }) => {
      addSuccessToaster('[useSerialConnection] Data received from:', event.port);

      if (event.port !== state.connectedPort) {
        addSuccessToaster('[useSerialConnection] Data from different port, ignoring', '');
        return;
      }

      try {
        const parsed = JSON.parse(event.data) as SerialDataPacket;
        parsed.timestamp = Date.now();

        setState((prev) => {
          const newBuffer = [...prev.dataBuffer, parsed].slice(-MAX_BUFFER_SIZE);

          return {
            ...prev,
            lastData: parsed,
            dataBuffer: newBuffer,
            packetsReceived: prev.packetsReceived + 1,
          };
        });
      } catch (err) {
        addDangerToaster('[useSerialConnection] Error parsing data:', String(err));
      }
    };

    const handleClosed = (port: string) => {
      addSuccessToaster('[useSerialConnection] Port closed:', port);

      if (port === state.connectedPort && !isDisconnectingRef.current) {
        setState((prev) => ({
          ...prev,
          connectedPort: null,
          lastData: null,
          dataBuffer: [],
          packetsReceived: 0,
        }));
        addDangerToaster(
          t('serialPort.status.disconnected'),
          `${t('serialPort.info.path')}: ${port}`,
        );
      }
    };

    const handleError = (data: { port: string; error: string }) => {
      addDangerToaster('[useSerialConnection] Port error:', String(data));

      if (data.port === state.connectedPort) {
        setState((prev) => ({
          ...prev,
          error: data.error,
          connectedPort: null, // Сбрасываем подключение при ошибке
          lastData: null,
          dataBuffer: [],
          packetsReceived: 0,
        }));
        addDangerToaster(t('serialPort.alerts.error'), data.error);
      }
    };

    unsubscribeDataRef.current = serialApi.onData(handleData);
    unsubscribeClosedRef.current = serialApi.onClosed(handleClosed);
    unsubscribeErrorRef.current = serialApi.onError(handleError);

    return () => {
      if (unsubscribeDataRef.current) unsubscribeDataRef.current();
      if (unsubscribeClosedRef.current) unsubscribeClosedRef.current();
      if (unsubscribeErrorRef.current) unsubscribeErrorRef.current();
    };
  }, [state.connectedPort, t]);

  // Cleanup при размонтировании
  useEffect(() => {
    return () => {
      if (state.connectedPort && !isDisconnectingRef.current) {
        addSuccessToaster(
          '[useSerialConnection] Cleanup: disconnecting from:',
          state.connectedPort,
        );
        isDisconnectingRef.current = true;
        serialApi.close(state.connectedPort);
      }
    };
  }, [state.connectedPort]);

  return {
    ...state,
    loadPorts,
    handlePortChange,
    connectToPort,
    disconnectPort,
    setAutoConnect,
  };
};
