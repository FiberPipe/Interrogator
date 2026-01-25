import { useState, useEffect, useCallback, useRef } from 'react';

import { addDangerToaster, addSuccessToaster } from '../../../shared/ui';

interface SensorRecord {
  id_record: number;
  time: string;
  [key: string]: any;
}

export const useSerialData = (port: string | null) => {
  const [latestData, setLatestData] = useState<SensorRecord | null>(null);
  const [rawData, setRawData] = useState<string>('');
  const [recordCount, setRecordCount] = useState(0);

  const unsubscribeRef = useRef<(() => void) | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    // Сброс при смене порта
    setLatestData(null);
    setRawData('');
    setRecordCount(0);

    if (!port) {
      addSuccessToaster('[useSerialData] No port connected');
      return;
    }

    addSuccessToaster('[useSerialData] Starting to listen for data from:', port);

    const handleData = (event: { port: string; data: string }) => {
      if (event.port !== port) return;
      if (!isMountedRef.current) return;

      addSuccessToaster('[useSerialData] Received data:', event.data);

      setRawData(event.data);
      setRecordCount((prev) => prev + 1);

      try {
        const parsed = JSON.parse(event.data);
        setLatestData(parsed);
      } catch (err) {
        addDangerToaster('[useSerialData] Parse error:', err);
      }
    };

    unsubscribeRef.current = window.serial.onData(handleData);

    return () => {
      addSuccessToaster('[useSerialData] Cleaning up listener');
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [port]);

  const clear = useCallback(() => {
    setLatestData(null);
    setRawData('');
    setRecordCount(0);
  }, []);

  return {
    latestData,
    rawData,
    recordCount,
    clear,
  };
};
