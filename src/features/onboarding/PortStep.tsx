import { useEffect, useState } from 'react';
import { Card, Select, SelectItem, Button, Alert, Chip } from '@heroui/react';
import { useComPort } from '../com-port/ui/useComport';

export default function PortStep({ onBack, onFinish }: any) {
  const {
    ports,
    selectedPort,
    connectedPort,
    loading,
    connecting,
    error,
    loadPorts,
    handlePortChange,
    connectToPort,
  } = useComPort();

  const [localSelected, setLocalSelected] = useState<string | null>(selectedPort || null);

  useEffect(() => {
    loadPorts();
  }, [loadPorts]);

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

  const isFinishEnabled = !!connectedPort;

  return (
    <Card className="p-6 flex flex-col gap-6 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Настройка COM-порта</h2>

      <div className="flex flex-col gap-3">
        <Select
          label="COM-порт"
          placeholder="Выберите порт"
          selectedKeys={localSelected ? [localSelected] : []}
          onSelectionChange={handleSelectChange}
          isDisabled={loading || connecting}
          variant="bordered"
        >
          {ports.length === 0 ? (
            <SelectItem key="no-ports" isDisabled>
              Нет доступных портов
            </SelectItem>
          ) : (
            ports.map((port) => (
              <SelectItem key={port.path} textValue={port.path} description={port.manufacturer || 'Unknown'}>
                <div className="flex justify-between items-center w-full">
                  <span className="font-medium">{port.path}</span>
                  {port.busy && (
                    <Chip size="sm" color="warning" variant="flat">
                      занят
                    </Chip>
                  )}
                </div>
              </SelectItem>
            ))
          )}
        </Select>

        {error && <Alert color="danger" title="Ошибка">{error}</Alert>}
        {connectedPort && (
          <Alert color="success" title="Подключено">
            Активное соединение с портом: <strong>{connectedPort}</strong>
          </Alert>
        )}
      </div>

      {/* Кнопки действий */}
      <div className="flex justify-between mt-4">
        <Button variant="light" onPress={onBack}>
          ← Назад
        </Button>

        <div className="flex gap-2">
          {!connectedPort && (
            <Button
              color="primary"
              variant="solid"
              isDisabled={!localSelected || connecting || loading}
              isLoading={connecting}
              onPress={handleConnect}
            >
              Подключить
            </Button>
          )}

          {isFinishEnabled && (
            <Button color="success" variant="solid" onPress={() => onFinish({ lastPort: connectedPort })}>
              Завершить
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
