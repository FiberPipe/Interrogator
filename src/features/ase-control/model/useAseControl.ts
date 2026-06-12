// src/features/ase-control/model/useAseControl.ts

import { useCallback, useEffect, useRef, useState } from 'react';

import { aseApi } from '../../../shared/api/ase.api';
import { serialApi } from '../../../shared/api/serial.api';
import type { SerialPortInfo } from '../../../shared/types/serial.types';
import type { AseInfo } from '../../../shared/types/ase.types';
import { addDangerToaster, addSuccessToaster } from '../../../shared/ui';

interface AseControlState {
  ports: SerialPortInfo[];
  selectedPort: string | null;
  connectedPort: string | null;
  info: AseInfo | null;
  powerMw: number;
  enabled: boolean;
  lastRaw: number | null;
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
  loading: false,
  busy: false,
  error: null,
};

export const useAseControl = () => {
  const [state, setState] = useState<AseControlState>(INITIAL_STATE);
  const unsubscribeRef = useRef<Array<() => void>>([]);

  const patch = useCallback((partial: Partial<AseControlState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  }, []);

  /** Загрузить список доступных портов. */
  const loadPorts = useCallback(async () => {
    patch({ loading: true, error: null });
    try {
      const ports = await serialApi.getPorts();
      patch({ ports, loading: false });
    } catch (err) {
      addDangerToaster('[useAseControl] Failed to load ports', String(err));
      patch({ loading: false, error: String(err) });
    }
  }, [patch]);

  const selectPort = useCallback(
    (path: string | null) => {
      patch({ selectedPort: path });
    },
    [patch],
  );

  /** Подключиться к выбранному порту и прочитать параметры. */
  const connect = useCallback(async () => {
    if (state.selectedPort === null) return;
    patch({ busy: true, error: null });

    const result = await aseApi.connect(state.selectedPort);
    if (result.error !== undefined) {
      addDangerToaster('[useAseControl] Connect failed', result.error);
      patch({ busy: false, error: result.error });
      return;
    }

    const infoResult = await aseApi.getInfo();
    addSuccessToaster('[useAseControl] Connected', state.selectedPort);
    patch({
      connectedPort: state.selectedPort,
      info: infoResult.info ?? null,
      enabled: false,
      busy: false,
    });
  }, [state.selectedPort, patch]);

  /** Отключиться от источника. */
  const disconnect = useCallback(async () => {
    patch({ busy: true });
    await aseApi.disconnect();
    patch({
      connectedPort: null,
      info: null,
      enabled: false,
      lastRaw: null,
      busy: false,
    });
  }, [patch]);

  const setPowerMw = useCallback(
    (value: number) => {
      patch({ powerMw: value });
    },
    [patch],
  );

  /** Применить мощность (CMD 0xC3). */
  const applyPower = useCallback(async () => {
    patch({ busy: true, error: null });
    const result = await aseApi.setPower(state.powerMw);
    if (result.error !== undefined) {
      addDangerToaster('[useAseControl] Set power failed', result.error);
      patch({ busy: false, error: result.error });
      return;
    }
    addSuccessToaster('[useAseControl] Power applied', `${state.powerMw} mW → raw ${result.raw}`);
    patch({ lastRaw: result.raw ?? null, busy: false });
  }, [state.powerMw, patch]);

  /** Включить/выключить излучение (CMD 0xC1). */
  const toggleEmission = useCallback(
    async (next: boolean) => {
      patch({ busy: true, error: null });
      const result = await aseApi.setEnabled(next);
      if (result.error !== undefined) {
        addDangerToaster('[useAseControl] Toggle emission failed', result.error);
        patch({ busy: false, error: result.error });
        return;
      }
      patch({ enabled: next, busy: false });
    },
    [patch],
  );

  // Подписка на закрытие/ошибки порта со стороны main-процесса.
  useEffect(() => {
    unsubscribeRef.current = [
      aseApi.onClosed(() => {
        patch({ connectedPort: null, info: null, enabled: false, lastRaw: null });
      }),
      aseApi.onError((event) => {
        addDangerToaster('[useAseControl] Port error', event.error);
        patch({ connectedPort: null, info: null, enabled: false, error: event.error });
      }),
    ];

    void loadPorts();

    return () => {
      unsubscribeRef.current.forEach((unsub) => unsub());
      unsubscribeRef.current = [];
    };
  }, [loadPorts, patch]);

  return {
    ...state,
    isConnected: state.connectedPort !== null,
    loadPorts,
    selectPort,
    connect,
    disconnect,
    setPowerMw,
    applyPower,
    toggleEmission,
  };
};
