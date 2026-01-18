import { useState, useEffect, useCallback, useRef } from 'react';
import { RowData } from '../../../shared/types/microcontroller-data';

const MAX_BUFFER_SIZE = 200;

export interface SerialDataPoint extends RowData {
  timestamp: string; // Временная метка для отображения
  index: number; // Индекс записи
}

export const useSerialData = (port: string | null) => {
  const [dataBuffer, setDataBuffer] = useState<SerialDataPoint[]>([]);
  const [latestData, setLatestData] = useState<SerialDataPoint | null>(null);
  const [isReceiving, setIsReceiving] = useState(false);
  
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!port) {
      setIsReceiving(false);
      return;
    }

    console.log('[useSerialData] Starting to listen for data from:', port);
    setIsReceiving(true);

    const handleData = (event: { port: string; data: string }) => {
      if (event.port !== port) return;

      try {
        const parsed = JSON.parse(event.data) as RowData;
        
        const dataPoint: SerialDataPoint = {
          ...parsed,
          timestamp: parsed.time || new Date().toLocaleTimeString(),
          index: indexRef.current++,
        };

        setLatestData(dataPoint);

        setDataBuffer((prev) => {
          const updated = [...prev, dataPoint];
          // Ограничиваем размер буфера
          if (updated.length > MAX_BUFFER_SIZE) {
            return updated.slice(updated.length - MAX_BUFFER_SIZE);
          }
          return updated;
        });
      } catch (err) {
        console.error('[useSerialData] Parse error:', err);
      }
    };

    unsubscribeRef.current = window.serial.onData(handleData);

    return () => {
      console.log('[useSerialData] Cleaning up listener');
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      setIsReceiving(false);
    };
  }, [port]);

  const clearBuffer = useCallback(() => {
    console.log('[useSerialData] Clearing buffer');
    setDataBuffer([]);
    indexRef.current = 0;
  }, []);

  return {
    dataBuffer,
    latestData,
    isReceiving,
    clearBuffer,
  };
};
