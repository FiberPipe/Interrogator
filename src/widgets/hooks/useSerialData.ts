// src/widgets/hooks/useSerialData.ts
import { useEffect, useState, useRef } from 'react';
import { addDangerToaster } from '../../shared/ui';
import { RowData } from '../../shared/types/microcontroller-data';

interface SerialDataEvent {
  port: string;
  data: string;
}

interface UseSerialDataReturn {
  dataBuffer: RowData[];
  isReceiving: boolean;
  clearBuffer: () => void;
  latestData: RowData | null;
}

const BUFFER_SIZE = 200; // Максимум 200 записей

export const useSerialData = (selectedPort: string | null): UseSerialDataReturn => {
  console.log('[useSerialData] 🎯 Hook called with port:', selectedPort);

  const [dataBuffer, setDataBuffer] = useState<RowData[]>([]);
  const [isReceiving, setIsReceiving] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const parseSerialData = (rawData: string): RowData | null => {
    try {
      const lines = rawData.split('\n').filter(line => line.trim());

      for (const line of lines) {
        if (line.includes('{')) {
          return JSON.parse(line) as RowData;
        }
      }

      return null;
    } catch (err) {
      console.error('[useSerialData] Parse error:', err);
      return null;
    }
  };

  useEffect(() => {
    console.log('[useSerialData] Effect running, port:', selectedPort);

    if (unsubscribeRef.current) {
      console.log('[useSerialData] Cleaning up previous subscription');
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    if (!selectedPort) {
      console.log('[useSerialData] No port, clearing data');
      setIsReceiving(false);
      setDataBuffer([]);
      return;
    }

    console.log('[useSerialData] Subscribing to:', selectedPort);
    setIsReceiving(true);

    const handleData = (payload: SerialDataEvent) => {
      if (payload.port !== selectedPort) return;

      const parsed = parseSerialData(payload.data);

      if (parsed) {
        console.log('[useSerialData] ✅ Data:', parsed.id);

        setDataBuffer(prev => {
          // Добавляем новую запись и оставляем только последние BUFFER_SIZE
          const newBuffer = [...prev, parsed].slice(-BUFFER_SIZE);
          return newBuffer;
        });
      }
    };

    const handleClosed = (port: string) => {
      console.log('[useSerialData] Port closed:', port);
      if (port === selectedPort) {
        setIsReceiving(false);
        addDangerToaster('Порт закрыт', `Соединение с ${port} разорвано`);
      }
    };

    const unsubData = window.serial.onData(handleData);
    const unsubClosed = window.serial.onClosed(handleClosed);

    unsubscribeRef.current = () => {
      unsubData();
      unsubClosed();
    };

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [selectedPort]);

  const clearBuffer = () => {
    console.log('[useSerialData] Clearing buffer');
    setDataBuffer([]);
  };

  return {
    dataBuffer,
    isReceiving,
    clearBuffer,
    latestData: dataBuffer[dataBuffer.length - 1] || null,
  };
};
