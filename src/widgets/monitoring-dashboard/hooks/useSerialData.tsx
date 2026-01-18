import { useState, useEffect, useRef } from 'react';

interface DataPoint {
  id: string;
  time: string;
  timestamp: string;
  [key: string]: any;
}

const MAX_BUFFER_SIZE = 200;

export const useSerialData = (port: string | null) => {
  const [dataBuffer, setDataBuffer] = useState<DataPoint[]>([]);
  const [latestData, setLatestData] = useState<DataPoint | null>(null);
  const [isReceiving, setIsReceiving] = useState(false);

  const unsubscribeRef = useRef<(() => void) | null>(null);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!port) {
      setIsReceiving(false);
      return;
    }

    console.log('[useSerialData] Starting monitoring:', port);
    setIsReceiving(true);

    const handleData = (event: { port: string; data: string }) => {
      if (event.port !== port) return;

      try {
        const parsed = JSON.parse(event.data);

        const dataPoint: DataPoint = {
          ...parsed,
          timestamp: parsed.time || new Date().toLocaleTimeString(),
          index: indexRef.current++,
        };

        setLatestData(dataPoint);

        setDataBuffer((prev) => {
          const updated = [...prev, dataPoint];
          return updated.length > MAX_BUFFER_SIZE
            ? updated.slice(updated.length - MAX_BUFFER_SIZE)
            : updated;
        });
      } catch (err) {
        console.error('[useSerialData] Parse error:', err);
      }
    };

    unsubscribeRef.current = window.serial.onData(handleData);

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      setIsReceiving(false);
    };
  }, [port]);

  const clearBuffer = () => {
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
