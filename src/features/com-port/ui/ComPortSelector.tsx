import { Card, Select, SelectItem, Button, Alert } from '@heroui/react';
import { useComPort } from './useComport';

export const ComPortSelector = () => {
  const { ports, selectedPort, loading, loadPorts, handlePortChange } = useComPort();

  return (
    <Card className="p-6 flex flex-col gap-4">
      <h3 className="text-xl font-semibold">COM-порт</h3>
      <p className="text-sm text-default-500">
        Выберите COM-порт для подключения к устройству.
      </p>

      {!selectedPort && (
        <Alert color="warning" title="COM-порт не выбран">
          Пожалуйста, выберите порт для корректной работы приложения.
        </Alert>
      )}

      <Select
        label="COM-порт"
        placeholder="Выберите порт"
        selectedKeys={selectedPort ? [selectedPort] : []}
        onSelectionChange={(keys) => handlePortChange(Array.from(keys)[0] as string)}
        disabled={loading}
      >
        {ports.map((port) => (
          <SelectItem key={port.path}>
            {port.friendlyName ?? port.path}
          </SelectItem>
        ))}
      </Select>

      <Button variant="flat" onPress={loadPorts} disabled={loading}>
        {loading ? 'Обновление...' : 'Обновить список портов'}
      </Button>
    </Card>
  );
};
