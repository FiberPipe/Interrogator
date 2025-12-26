import { Card, Button, Chip } from '@heroui/react';
import { useEffect, useRef, useMemo, useCallback } from 'react';

import { useSerialData } from './hooks/useSerialData';
import { RowData } from '../shared/types/microcontroller-data';
import { LineChartWithConfidence } from '../shared/ui';
import { useComPort } from '../features/com-port/ui/useComport';

const COLORS = [
  '#4f46e5', '#e11d48', '#059669', '#f97316', '#8b5cf6',
  '#06b6d4', '#ec4899', '#14b8a6', '#f59e0b', '#6366f1',
  '#10b981', '#ef4444', '#3b82f6', '#f43f5e', '#a855f7', '#84cc16'
];

export const PowerChartWidget: React.FC = () => {
  const {
    selectedPort,
    connectedPort,
    connectToPort,
    disconnectPort,
  } = useComPort();

  const { dataBuffer, isReceiving, clearBuffer, latestData } = useSerialData(connectedPort);

  const wasConnectedRef = useRef(false);
  const isConnectingRef = useRef(false);

  // Автоподключение
  useEffect(() => {
    if (connectedPort || !selectedPort || isConnectingRef.current) return;

    isConnectingRef.current = true;

    const doConnect = async () => {
      try {
        const success = await connectToPort(selectedPort);
        if (success) wasConnectedRef.current = true;
      } finally {
        isConnectingRef.current = false;
      }
    };

    doConnect();
  }, [selectedPort, connectedPort, connectToPort]);

  // Мемоизируем серии для графика
  const series = useMemo(() => {
    if (dataBuffer.length === 0) return [];

    return Array.from({ length: 16 }, (_, i) => {
      const pKey = `P${i}` as keyof RowData;
      const stdDevKey = `stdDev${i}` as keyof RowData;

      return {
        key: `P${i}`,
        label: `P${i}`,
        color: COLORS[i],
        showConfidence: true,
        data: dataBuffer.map((point, idx) => {
          const yValue = point[pKey] as number;
          const stdDevValue = point[stdDevKey] as number;

          return {
            x: idx,
            y: yValue,
            yMin: yValue - stdDevValue,
            yMax: yValue + stdDevValue,
          };
        }),
      };
    });
  }, [dataBuffer]);

  const averagePower = useMemo(() => {
    if (!latestData) return 0;
    return (latestData.P0 + latestData.P1 + latestData.P2 + latestData.P3) / 4;
  }, [latestData]);

  const handleClearBuffer = useCallback(() => {
    clearBuffer();
  }, [clearBuffer]);

  return (
    <Card className="p-6 flex flex-col gap-4">
      {/* Заголовок */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Power (P) - Real-time</h3>
        <div className="flex gap-2 items-center">
          {isReceiving && (
            <Chip color="success" size="sm" variant="dot">
              🔴 LIVE ({dataBuffer.length}/200)
            </Chip>
          )}
          {connectedPort && !isReceiving && (
            <Chip color="warning" size="sm" variant="dot">
              ⏳ Ожидание
            </Chip>
          )}
          <Button size="sm" color="warning" onPress={handleClearBuffer}>
            Очистить
          </Button>
        </div>
      </div>

      {/* Статус */}
      <div className="p-4 bg-default-100 rounded-lg">
        <div className="text-sm font-mono space-y-1">
          <div>Selected: <strong>{selectedPort || 'none'}</strong></div>
          <div>
            Connected:{' '}
            <strong className={connectedPort ? 'text-success' : 'text-danger'}>
              {connectedPort || 'none'}
            </strong>
          </div>
          <div>Receiving: <strong>{isReceiving ? '✅' : '❌'}</strong></div>
          <div>Buffer: <strong>{dataBuffer.length}/200</strong></div>
        </div>

        {selectedPort && !connectedPort && (
          <Button
            color="primary"
            className="mt-3 w-full"
            onPress={() => connectToPort(selectedPort)}
          >
            🔌 Подключиться
          </Button>
        )}

        {connectedPort && (
          <Button
            color="danger"
            className="mt-3 w-full"
            onPress={disconnectPort}
          >
            🔌 Отключиться
          </Button>
        )}
      </div>

      {/* Информация о последних данных */}
      {latestData && (
        <div className="flex gap-4 text-sm">
          <div className="text-default-500">
            Запись: <strong>#{latestData.id}</strong>
          </div>
          <div className="text-default-500">
            Время: <strong>{latestData.time}</strong>
          </div>
          <div className="text-default-500">
            Средняя: <strong>{averagePower.toFixed(3)} W</strong>
          </div>
        </div>
      )}

      {/* График */}
      {series.length > 0 ? (
        <LineChartWithConfidence series={series} height={400} />
      ) : (
        <div className="h-64 flex flex-col items-center justify-center text-default-400 gap-2">
          <div className="text-lg">
            {!connectedPort ? '📡 Порт не подключен' : '⏳ Ожидание данных...'}
          </div>
          <div className="text-sm">
            {!connectedPort && selectedPort && 'Нажмите "Подключиться"'}
            {!connectedPort && !selectedPort && 'Выберите порт'}
            {connectedPort && 'Данные появятся через 1-2 секунды'}
          </div>
        </div>
      )}

      {/* JSON данных */}
      {latestData && (
        <details className="text-xs text-default-400 font-mono">
          <summary className="cursor-pointer hover:text-default-600">
            📝 Последние данные (JSON)
          </summary>
          <pre className="mt-2 p-3 bg-default-100 rounded-lg overflow-auto max-h-64 border">
            {JSON.stringify(latestData, null, 2)}
          </pre>
        </details>
      )}

      {/* Статистика */}
      {dataBuffer.length > 0 && (
        <div className="flex gap-4 text-xs text-default-400 border-t pt-2">
          <div>Записей: {dataBuffer.length}/200</div>
          <div>Частота: ~1 Hz</div>
          {dataBuffer.length === 200 && (
            <div className="text-warning">⚠️ Буфер заполнен, старые данные удаляются</div>
          )}
        </div>
      )}
    </Card>
  );
};
