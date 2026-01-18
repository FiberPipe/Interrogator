// src/features/serial-connection/model/useSerialConnection.ts
import { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { SerialPortInfo, SerialConnectionState, SerialDataPacket } from '../../../entities/serial-port/model/types';
import { addSuccessToaster, addDangerToaster } from '../../../shared/ui';

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
    console.log('[useSerialConnection] Loading ports...');
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const list = await window.serial.getPorts();
      console.log('[useSerialConnection] Ports loaded:', list);

      setState((prev) => {
        const newState = { ...prev, ports: list, loading: false };

        // Проверяем состояние выбранного порта
        if (prev.selectedPort) {
          const selectedPortInfo = list.find((p) => p.path === prev.selectedPort);

          if (!selectedPortInfo) {
            console.log('[useSerialConnection] Selected port no longer exists');
            newState.connectedPort = null;
            newState.selectedPort = null;
          }
        }

        return newState;
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('[useSerialConnection] Error loading ports:', err);
      setState((prev) => ({ ...prev, error: errorMsg, loading: false }));
      addDangerToaster(t('serialPort.alerts.error'), errorMsg);
    }
  }, [t]);

  // Выбор порта
  const handlePortChange = useCallback(async (port: string) => {
    console.log('[useSerialConnection] Changing port to:', port);

    // Если уже подключены к другому порту - отключаемся
    if (state.connectedPort && state.connectedPort !== port) {
      console.log('[useSerialConnection] Need to disconnect from current port first');
      isDisconnectingRef.current = true;

      try {
        await window.serial.close(state.connectedPort);
        console.log('[useSerialConnection] Successfully disconnected from:', state.connectedPort);
      } catch (err) {
        console.error('[useSerialConnection] Error disconnecting:', err);
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
      await window.appData.set('selectedPort', port);
      console.log('[useSerialConnection] Port saved');
    } catch (err) {
      console.error('[useSerialConnection] Error saving port:', err);
    }
  }, [state.connectedPort]);

  // Подключение к порту
  const connectToPort = useCallback(
    async (port: string, baudRate = 115200): Promise<boolean> => {
      console.log('[useSerialConnection] Connecting to:', port);

      // Предотвращаем подключение во время отключения
      if (isDisconnectingRef.current) {
        console.log('[useSerialConnection] Currently disconnecting, wait...');
        return false;
      }

      setState((prev) => ({ ...prev, connecting: true, error: null }));

      try {
        // Проверяем, не подключены ли мы уже к этому порту
        if (state.connectedPort === port) {
          console.log('[useSerialConnection] Already connected to this port');
          setState((prev) => ({ ...prev, connecting: false }));
          return true;
        }

        // Отключаемся от текущего порта если есть
        if (state.connectedPort && state.connectedPort !== port) {
          console.log('[useSerialConnection] Closing current port:', state.connectedPort);
          isDisconnectingRef.current = true;
          await window.serial.close(state.connectedPort);
          isDisconnectingRef.current = false;

          // Небольшая задержка для стабилизации
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        console.log('[useSerialConnection] Opening port:', port);
        const result = await window.serial.open(port, baudRate);
        console.log('[useSerialConnection] Connection result:', result);

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
          `${t('serialPort.alerts.connectedTo')} ${port}`
        );

        // Обновляем список портов для обновления статуса busy
        loadPorts();

        return true;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error('[useSerialConnection] Connection error:', err);
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
    [state.connectedPort, t, loadPorts]
  );

  // Отключение от порта
  const disconnectPort = useCallback(async () => {
    if (!state.connectedPort || isDisconnectingRef.current) {
      console.log('[useSerialConnection] Already disconnecting or no port connected');
      return;
    }

    console.log('[useSerialConnection] Disconnecting from:', state.connectedPort);
    isDisconnectingRef.current = true;
    const portToClose = state.connectedPort;

    try {
      const result = await window.serial.close(portToClose);

      if (result.error) {
        console.error('[useSerialConnection] Disconnect error:', result.error);
        // Не показываем ошибку если порт уже закрыт
        if (!result.error.includes('not opened')) {
          addDangerToaster(t('serialPort.alerts.error'), result.error);
        }
      } else {
        addSuccessToaster(
          t('serialPort.status.disconnected'),
          `${t('serialPort.info.path')}: ${portToClose}`
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
      console.error('[useSerialConnection] Disconnect error:', err);
      addDangerToaster(t('serialPort.alerts.error'), errorMsg);
    } finally {
      isDisconnectingRef.current = false;
    }
  }, [state.connectedPort, t, loadPorts]);

  // Установка автоподключения
  const setAutoConnect = useCallback(async (value: boolean) => {
    console.log('[useSerialConnection] Setting auto-connect:', value);
    setState((prev) => ({ ...prev, autoConnect: value }));

    try {
      await window.appData.set('autoConnect', value);
      console.log('[useSerialConnection] Auto-connect saved');
    } catch (err) {
      console.error('[useSerialConnection] Error saving auto-connect:', err);
    }
  }, []);

  // Инициализация
  useEffect(() => {
    if (isInitializedRef.current) return;

    console.log('[useSerialConnection] Initializing...');
    isInitializedRef.current = true;

    const initialize = async () => {
      try {
        const savedData = await window.appData.getAll();
        console.log('[useSerialConnection] Saved data:', savedData);

        setState((prev) => ({
          ...prev,
          selectedPort: savedData?.selectedPort as string || null,
          autoConnect: savedData?.autoConnect as boolean || false,
        }));

        await loadPorts();
      } catch (err) {
        console.error('[useSerialConnection] Error during initialization:', err);
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
      const portExists = state.ports.some(p => p.path === state.selectedPort);

      if (portExists) {
        console.log('[useSerialConnection] Auto-connecting to:', state.selectedPort);
        connectToPort(state.selectedPort);
      } else {
        console.log('[useSerialConnection] Selected port not available for auto-connect');
      }
    }
  }, [
    state.autoConnect,
    state.selectedPort,
    state.connectedPort,
    state.connecting,
    state.ports,
    connectToPort
  ]);

  // Подписка на данные
  useEffect(() => {
    console.log('[useSerialConnection] Setting up data listener');

    const handleData = (event: { port: string; data: string }) => {
      console.log('[useSerialConnection] Data received from:', event.port);

      if (event.port !== state.connectedPort) {
        console.log('[useSerialConnection] Data from different port, ignoring');
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
        console.error('[useSerialConnection] Error parsing data:', err);
      }
    };

    const handleClosed = (port: string) => {
      console.log('[useSerialConnection] Port closed:', port);

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
          `${t('serialPort.info.path')}: ${port}`
        );
      }
    };

    const handleError = (data: { port: string; error: string }) => {
      console.error('[useSerialConnection] Port error:', data);

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

    unsubscribeDataRef.current = window.serial.onData(handleData);
    unsubscribeClosedRef.current = window.serial.onClosed(handleClosed);
    unsubscribeErrorRef.current = window.serial.onError(handleError);

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
        console.log('[useSerialConnection] Cleanup: disconnecting from:', state.connectedPort);
        isDisconnectingRef.current = true;
        window.serial.close(state.connectedPort);
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
