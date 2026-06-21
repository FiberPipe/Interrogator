// src/features/ase-control/model/useAseControl.ts

import { useCallback, useEffect, useSyncExternalStore } from 'react';

import { aseApi } from '../../../shared/api/ase.api';
import { serialApi } from '../../../shared/api/serial.api';
import type { SerialPortInfo } from '../../../shared/types/serial.types';
import type { AseInfo, AseStateEvent, AseTrafficEvent } from '../../../shared/types/ase.types';
import { addDangerToaster, addSuccessToaster } from '../../../shared/ui';

interface AseControlState {
  ports: SerialPortInfo[];
  selectedPort: string | null;
  connectedPort: string | null;
  info: AseInfo | null;
  powerMw: number;
  enabled: boolean;
  lastRaw: number | null;
  /** Подтверждённая устройством оптическая мощность (mW). */
  actualPowerMw: number | null;
  traffic: AseTrafficEvent[];
  loading: boolean;
  busy: boolean;
  error: string | null;
}

const INITIAL_STATE: AseControlState = {
  ports: [],
  selectedPort: null,
  connectedPort: null,
  info: null,
  powerMw: 0,
  enabled: false,
  lastRaw: null,
  actualPowerMw: null,
  traffic: [],
  loading: false,
  busy: false,
  error: null,
};

/** Сколько строк обмена держим в буфере для отображения. */
const MAX_TRAFFIC = 200;

/**
 * Модульное хранилище состояния ASE-панели. Живёт вне React, поэтому
 * введённые настройки (порт, мощность, статус подключения, лог обмена) не
 * сбрасываются при размонтировании виджета (например, при смене вкладки).
 */
let state: AseControlState = INITIAL_STATE;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

function setState(partial: Partial<AseControlState>): void {
  state = { ...state, ...partial };
  emit();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): AseControlState {
  return state;
}

// Подписка на события main-процесса навешивается один раз на всё приложение,
// независимо от количества смонтированных компонентов.
let ipcBound = false;

function bindIpcOnce(): void {
  if (ipcBound) return;
  ipcBound = true;

  aseApi.onClosed(() => {
    setState({ connectedPort: null, info: null, enabled: false, lastRaw: null, actualPowerMw: null });
  });

  aseApi.onError((event) => {
    addDangerToaster('[useAseControl] Port error', event.error);
    setState({ connectedPort: null, info: null, enabled: false, error: event.error });
  });

  aseApi.onData((event) => {
    setState({ traffic: [...state.traffic, event].slice(-MAX_TRAFFIC) });
  });

  // Актуальное состояние лазера (heartbeat + подтверждения команд).
  aseApi.onState((event: AseStateEvent) => {
    setState({
      enabled: event.enabled,
      lastRaw: event.rawPower,
      actualPowerMw: event.powerMw,
    });
  });
}

export const useAseControl = () => {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot);

  /** Загрузить список доступных портов. */
  const loadPorts = useCallback(async () => {
    setState({ loading: true, error: null });
    try {
      const ports = await serialApi.getPorts();
      setState({ ports, loading: false });
    } catch (err) {
      addDangerToaster('[useAseControl] Failed to load ports', String(err));
      setState({ loading: false, error: String(err) });
    }
  }, []);

  const selectPort = useCallback((path: string | null) => {
    setState({ selectedPort: path });
  }, []);

  /** Подключиться к выбранному порту и прочитать параметры. */
  const connect = useCallback(async () => {
    if (state.selectedPort === null) return;
    setState({ busy: true, error: null });

    const result = await aseApi.connect(state.selectedPort);
    if (result.error !== undefined) {
      addDangerToaster('[useAseControl] Connect failed', result.error);
      setState({ busy: false, error: result.error });
      return;
    }

    const infoResult = await aseApi.getInfo();
    addSuccessToaster('[useAseControl] Connected', state.selectedPort);
    setState({
      connectedPort: state.selectedPort,
      info: infoResult.info ?? null,
      enabled: false,
      busy: false,
    });
  }, []);

  /** Отключиться от источника. */
  const disconnect = useCallback(async () => {
    setState({ busy: true });
    await aseApi.disconnect();
    setState({
      connectedPort: null,
      info: null,
      enabled: false,
      lastRaw: null,
      actualPowerMw: null,
      busy: false,
    });
  }, []);

  const setPowerMw = useCallback((value: number) => {
    setState({ powerMw: value });
  }, []);

  /** Применить мощность (CMD 0xC3). */
  const applyPower = useCallback(async () => {
    setState({ busy: true, error: null });
    const result = await aseApi.setPower(state.powerMw);
    if (result.error !== undefined) {
      addDangerToaster('[useAseControl] Set power failed', result.error);
      setState({ busy: false, error: result.error });
      return;
    }
    addSuccessToaster('[useAseControl] Power applied', `${state.powerMw} mW → raw ${result.raw}`);
    setState({ lastRaw: result.raw ?? null, busy: false });
  }, []);

  /** Включить/выключить излучение (CMD 0xC1). */
  const toggleEmission = useCallback(async (next: boolean) => {
    setState({ busy: true, error: null });
    const result = await aseApi.setEnabled(next);
    if (result.error !== undefined) {
      addDangerToaster('[useAseControl] Toggle emission failed', result.error);
      setState({ busy: false, error: result.error });
      return;
    }
    setState({ enabled: next, busy: false });
  }, []);

  /** Очистить лог обмена. */
  const clearTraffic = useCallback(() => {
    setState({ traffic: [] });
  }, []);

  /** Сверить UI-состояние с реальным подключением в main-процессе. */
  const syncConnection = useCallback(async () => {
    const connected = await aseApi.isConnected();
    if (!connected) {
      if (state.connectedPort !== null) {
        setState({ connectedPort: null, info: null, enabled: false, lastRaw: null });
      }
      return;
    }
    if (state.info === null) {
      const infoResult = await aseApi.getInfo();
      setState({ info: infoResult.info ?? null });
    }
  }, []);

  // При монтировании: навесить IPC-слушатели (один раз), обновить порты и
  // синхронизироваться с фактическим состоянием подключения.
  useEffect(() => {
    bindIpcOnce();
    void loadPorts();
    void syncConnection();
  }, [loadPorts, syncConnection]);

  return {
    ...snapshot,
    isConnected: snapshot.connectedPort !== null,
    loadPorts,
    selectPort,
    connect,
    disconnect,
    setPowerMw,
    applyPower,
    toggleEmission,
    clearTraffic,
  };
};
