import { useState, useEffect, useRef } from 'react';

import { addDangerToaster, addSuccessToaster } from '../../../shared/ui';
import type { RowData } from '../../../shared/types/microcontroller-data';
import { serialApi } from '../../../shared/api/serial.api';

const MAX_BUFFER_SIZE = 200;

// Частота, с которой накопленные пакеты сбрасываются в React-state.
// Поток данных (10rps и выше) копится в буфере и применяется батчами,
// чтобы не вызывать полный ре-рендер графиков/таблиц на каждый пакет.
const FLUSH_INTERVAL_MS = 100;

export const useSerialData = (port: string | null) => {
  const [dataBuffer, setDataBuffer] = useState<RowData[]>([]);
  const [latestData, setLatestData] = useState<RowData | null>(null);
  const [isReceiving, setIsReceiving] = useState(false);

  const unsubscribeRef = useRef<(() => void) | null>(null);
  const indexRef = useRef(0);
  // Накопитель пакетов между сбросами в state.
  const pendingRef = useRef<RowData[]>([]);

  useEffect(() => {
    if (!port) {
      setIsReceiving(false);
      return;
    }

    addSuccessToaster('[useSerialData] Starting monitoring:', port);
    setIsReceiving(true);

    const handleData = (event: { port: string; data: string }) => {
      if (event.port !== port) return;

      try {
        const parsed = JSON.parse(event.data);

        const row: RowData = {
          ...parsed,
          timestamp: parsed.time || new Date().toLocaleTimeString(),
          index: indexRef.current++,
        };

        // Только копим — без setState на каждый пакет.
        pendingRef.current.push(row);
      } catch (err) {
        addDangerToaster('[useSerialData] Parse error:', err);
      }
    };

    const flush = () => {
      const pending = pendingRef.current;
      if (pending.length === 0) return;
      pendingRef.current = [];

      setLatestData(pending[pending.length - 1]);
      setDataBuffer((prev) => {
        const updated = prev.length === 0 ? pending : [...prev, ...pending];
        return updated.length > MAX_BUFFER_SIZE
          ? updated.slice(updated.length - MAX_BUFFER_SIZE)
          : updated;
      });
    };

    unsubscribeRef.current = serialApi.onData(handleData);
    const flushTimer = setInterval(flush, FLUSH_INTERVAL_MS);

    return () => {
      clearInterval(flushTimer);
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      pendingRef.current = [];
      setIsReceiving(false);
    };
  }, [port]);

  const clearBuffer = () => {
    pendingRef.current = [];
    setDataBuffer([]);
    indexRef.current = 0;
  };

  return {
    dataBuffer,
    latestData,
    isReceiving,
    clearBuffer,
  };
};
