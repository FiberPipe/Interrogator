// src/features/serial/ui/ComPortSelector.tsx
import { Card, Select, SelectItem, Button, Alert, Chip, Spinner, Switch } from '@heroui/react';
import { useEffect } from 'react';
import { useComPort } from './useComport';

export const ComPortSelector = () => {
  const {
    ports,
    selectedPort,
    connectedPort,
    loading,
    connecting,
    error,
    autoConnect,
    loadPorts,
    handlePortChange,
    connectToPort,
    disconnectPort,
    setAutoConnect,
  } = useComPort();

  const handleSelectChange = (keys: any) => {
    const port = Array.from(keys)[0] as string;
    if (port) {
      handlePortChange(port);
    }
  };

  const handleConnect = () => {
    if (selectedPort) {
      connectToPort(selectedPort);
    }
  };

  // Автоподключение при включенном тумблере
  useEffect(() => {
    if (autoConnect && selectedPort && !connectedPort && !connecting) {
      console.log('[ComPortSelector] Auto-connecting to:', selectedPort);
      connectToPort(selectedPort);
    }
  }, [autoConnect, selectedPort, connectedPort, connecting, connectToPort]);

  return (
    <Card className="p-6 flex flex-col gap-4">
      {/* Заголовок */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">COM-порт</h3>
        {loading && <Spinner size="sm" label="Загрузка..." />}
      </div>

      <p className="text-sm text-default-500">
        Выберите COM-порт для подключения к устройству.
      </p>

      {/* Статус подключения */}
      {connectedPort ? (
        <Alert color="success" title="Подключено">
          Активное соединение с портом: <strong>{connectedPort}</strong>
        </Alert>
      ) : !selectedPort ? (
        <Alert color="warning" title="COM-порт не выбран">
          Пожалуйста, выберите порт для корректной работы приложения.
        </Alert>
      ) : null}

      {/* Ошибка */}
      {error && (
        <Alert color="danger" title="Ошибка">
          {error}
        </Alert>
      )}

      {/* Селектор портов */}
      <Select
        label="COM-порт"
        placeholder="Выберите порт"
        selectedKeys={selectedPort ? [selectedPort] : []}
        onSelectionChange={handleSelectChange}
        isDisabled={loading || connecting}
        variant="bordered"
        description={
          ports.length === 0
            ? 'Нет доступных портов'
            : `Найдено портов: ${ports.length}`
        }
      >
        {ports.length === 0 ? (
          <SelectItem key="no-ports" isDisabled>
            Нет доступных портов
          </SelectItem>
        ) : (
          ports.map((port) => (
            <SelectItem
              key={port.path}
              textValue={port.path}
              description={port.manufacturer || 'Unknown manufacturer'}
            >
              <div className="flex justify-between items-center w-full">
                <span className="font-medium">{port.path}</span>
                <div className="flex gap-2">
                  {port.serialNumber && (
                    <span className="text-xs text-default-400">
                      S/N: {port.serialNumber}
                    </span>
                  )}
                  {port.busy && (
                    <Chip size="sm" color="warning" variant="flat">
                      занят
                    </Chip>
                  )}
                </div>
              </div>
            </SelectItem>
          ))
        )}
      </Select>

      {/* Автоподключение */}
      <div className="flex items-center justify-between p-3 bg-default-100 rounded-lg">
        <div className="flex flex-col">
          <span className="text-sm font-medium">Автоподключение</span>
          <span className="text-xs text-default-500">
            Автоматически подключаться при открытии страницы
          </span>
        </div>
        <Switch
          isSelected={autoConnect}
          onValueChange={setAutoConnect}
          color="success"
          size="sm"
        />
      </div>

      {/* Кнопки управления */}
      <div className="flex gap-2">
        <Button
          variant="flat"
          onPress={() => void loadPorts()}
          isDisabled={loading || connecting}
          isLoading={loading}
          className="flex-1"
        >
          🔄 {loading ? 'Обновление...' : 'Обновить'}
        </Button>

        {!autoConnect && (
          <>
            {connectedPort ? (
              <Button
                color="danger"
                variant="solid"
                onPress={() => void disconnectPort()}
                isDisabled={connecting}
                className="flex-1"
              >
                Отключить
              </Button>
            ) : (
              <Button
                color="primary"
                variant="solid"
                onPress={handleConnect}
                isDisabled={!selectedPort || connecting || loading}
                isLoading={connecting}
                className="flex-1"
              >
                {connecting ? 'Подключение...' : 'Подключить'}
              </Button>
            )}
          </>
        )}
      </div>

      {/* Дополнительная информация о выбранном порте */}
      {selectedPort && (
        <div className="text-xs text-default-400 bg-default-100 p-3 rounded-lg">
          <div className="font-semibold mb-1">Выбранный порт:</div>
          {ports
            .filter((p) => p.path === selectedPort)
            .map((port) => (
              <div key={port.path} className="space-y-1">
                <div>Путь: {port.path}</div>
                {port.manufacturer && <div>Производитель: {port.manufacturer}</div>}
                {port.serialNumber && <div>Серийный номер: {port.serialNumber}</div>}
                {port.vendorId && <div>Vendor ID: {port.vendorId}</div>}
                {port.productId && <div>Product ID: {port.productId}</div>}
                <div>
                  Статус:{' '}
                  <strong className={port.busy ? 'text-warning' : 'text-success'}>
                    {port.busy ? 'Занят' : 'Свободен'}
                  </strong>
                </div>
              </div>
            ))}
        </div>
      )}
    </Card>
  );
};
