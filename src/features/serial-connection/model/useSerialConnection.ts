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
          } else if (selectedPortInfo.busy && prev.connectedPort !== prev.selectedPort) {
            console.log('[useSerialConnection] Selected port is busy');
            newState.connectedPort = null;
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
    
    setState((prev) => {
      // Если уже подключены к другому порту - отключаемся
      if (prev.connectedPort && prev.connectedPort !== port) {
        console.log('[useSerialConnection] Disconnecting from:', prev.connectedPort);
        window.serial.close(prev.connectedPort);
        return {
          ...prev,
          selectedPort: port,
          connectedPort: null,
          lastData: null,
          dataBuffer: [],
          packetsReceived: 0,
        };
      }
      
      return { ...prev, selectedPort: port };
    });

    try {
      await window.appData.set('selectedPort', port);
      console.log('[useSerialConnection] Port saved');
    } catch (err) {
      console.error('[useSerialConnection] Error saving port:', err);
    }
  }, []);

  // Подключение к порту
  const connectToPort = useCallback(
    async (port: string, baudRate = 115200): Promise<boolean> => {
      console.log('[useSerialConnection] Connecting to:', port);
      setState((prev) => ({ ...prev, connecting: true, error: null }));

      try {
        // Отключаемся от текущего порта если есть
        if (state.connectedPort && state.connectedPort !== port) {
          console.log('[useSerialConnection] Closing current port:', state.connectedPort);
          await window.serial.close(state.connectedPort);
        }

        const result = await window.serial.open(port, baudRate);
        console.log('[useSerialConnection] Connection result:', result);

        if (result.error) {
          setState((prev) => ({
            ...prev,
            error: result.error || null,
            connecting: false,
          }));
          addDangerToaster(t('serialPort.alerts.error'), result.error);
          return false;
        }

        if (!result.ok) {
          setState((prev) => ({
            ...prev,
            error: 'Unknown error',
            connecting: false,
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
        }));
        
        addSuccessToaster(
          t('serialPort.status.connected'),
          `${t('serialPort.alerts.connectedTo')} ${port}`
        );
        
        // Обновляем список портов
        loadPorts();
        
        return true;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setState((prev) => ({
          ...prev,
          error: errorMsg,
          connecting: false,
        }));
        addDangerToaster(t('serialPort.alerts.error'), errorMsg);
        return false;
      }
    },
    [state.connectedPort, t, loadPorts]
  );

  // Отключение от порта
  const disconnectPort = useCallback(async () => {
    if (!state.connectedPort) return;

    console.log('[useSerialConnection] Disconnecting from:', state.connectedPort);

    try {
      const result = await window.serial.close(state.connectedPort);

      if (result.error) {
        addDangerToaster(t('serialPort.alerts.error'), result.error);
        return;
      }

      setState((prev) => ({
        ...prev,
        connectedPort: null,
        lastData: null,
        dataBuffer: [],
        packetsReceived: 0,
      }));
      
      addSuccessToaster(
        t('serialPort.status.disconnected'),
        `${t('serialPort.info.path')}: ${state.connectedPort}`
      );
      
      // Обновляем список портов
      loadPorts();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      addDangerToaster(t('serialPort.alerts.error'), errorMsg);
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
      state.ports.length > 0
    ) {
      console.log('[useSerialConnection] Auto-connecting to:', state.selectedPort);
      connectToPort(state.selectedPort);
    }
  }, [state.autoConnect, state.selectedPort, state.connectedPort, state.connecting, state.ports, connectToPort]);

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
      
      if (port === state.connectedPort) {
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
        setState((prev) => ({ ...prev, error: data.error }));
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
      if (state.connectedPort) {
        console.log('[useSerialConnection] Cleanup: disconnecting from:', state.connectedPort);
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
