import { useEffect, useState } from 'react';
import { Card, Select, SelectItem, Button, Alert, Chip } from '@heroui/react';
import { DataPreview } from './DataPreview';
import { useComPort } from '../model/useComport';

export default function PortStep({ onBack, onFinish }: any) {
  const {
    ports,
    selectedPort,
    connectedPort,
    loading,
    connecting,
    disconnecting,
    error,
    loadPorts,
    handlePortChange,
    connectToPort,
    disconnectPort,
  } = useComPort();

  const [localSelected, setLocalSelected] = useState<string | null>(selectedPort || null);

  // Синхронизация локального выбора с глобальным
  useEffect(() => {
    if (selectedPort !== localSelected) {
      setLocalSelected(selectedPort);
    }
  }, [selectedPort]);

  // Периодическое обновление списка портов
  useEffect(() => {
    const interval = setInterval(() => {
      if (!connecting && !disconnecting) {
        loadPorts();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [connecting, disconnecting, loadPorts]);

  const handleSelectChange = (keys: any) => {
    const port = Array.from(keys)[0] as string;
    setLocalSelected(port);
    if (port) handlePortChange(port);
  };

  const handleConnect = async () => {
    if (localSelected) {
      await connectToPort(localSelected);
    }
  };

  const handleDisconnect = async () => {
    await disconnectPort();
  };

  const isFinishEnabled = !!connectedPort;
  const isConnectDisabled =
    !localSelected || connecting || disconnecting || loading || connectedPort === localSelected;

  return (
    <div className="flex flex-col gap-4 w-full max-w-4xl mx-auto">
      <Card className="p-6 flex flex-col gap-6">
        <h2 className="text-2xl font-semibold mb-4">Настройка COM-порта</h2>

        <div className="flex flex-col gap-3">
          <Select
            label="COM-порт"
            placeholder="Выберите порт"
            selectedKeys={localSelected ? [localSelected] : []}
            onSelectionChange={handleSelectChange}
            isDisabled={loading || connecting || disconnecting}
            variant="bordered"
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
                  description={port.manufacturer || 'Unknown'}
                  isDisabled={port.busy && port.path !== connectedPort}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="font-medium">{port.path}</span>
                    <div className="flex gap-2">
                      {port.path === connectedPort && (
                        <Chip size="sm" color="success" variant="flat">
                          подключен
                        </Chip>
                      )}
                      {port.busy && port.path !== connectedPort && (
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

          {error && (
            <Alert color="danger" title="Ошибка">
              {error}
            </Alert>
          )}

          {connectedPort && (
            <Alert color="success" title="Подключено">
              Активное соединение с портом: <strong>{connectedPort}</strong>
            </Alert>
          )}
        </div>

        {/* Кнопки действий */}
        <div className="flex justify-between mt-4">
          <Button variant="light" onPress={onBack} isDisabled={connecting || disconnecting}>
            ← Назад
          </Button>

          <div className="flex gap-2">
            {connectedPort ? (
              <Button
                color="danger"
                variant="solid"
                isLoading={disconnecting}
                isDisabled={connecting}
                onPress={handleDisconnect}
              >
                Отключить
              </Button>
            ) : (
              <Button
                color="primary"
                variant="solid"
                isDisabled={isConnectDisabled}
                isLoading={connecting}
                onPress={handleConnect}
              >
                Подключить
              </Button>
            )}

            {isFinishEnabled && (
              <Button
                color="success"
                variant="solid"
                onPress={() => onFinish({ lastPort: connectedPort })}
                isDisabled={connecting || disconnecting}
              >
                Завершить
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Превью данных */}
      <DataPreview port={connectedPort} />
    </div>
  );
}
