import { useEffect, useState } from 'react';
import { Card, Select, SelectItem, Button, Alert } from '@heroui/react';
import { SerialPortInfo, getPorts } from '../model';

interface ComPortSelectorProps {
  selectedPort: string | null;
  onSelectPort: (port: string) => void;
}

export const ComPortSelector = ({ selectedPort, onSelectPort }: ComPortSelectorProps) => {
  const [ports, setPorts] = useState<SerialPortInfo[]>([]);

  const loadPorts = async () => {
    const list = await getPorts();
    setPorts(list);
  };

  useEffect(() => {
    loadPorts();
  }, []);

  return (
    <Card className="p-6 flex flex-col gap-4">
      <h3 className="text-xl font-semibold">COM-порт</h3>
      <p className="text-sm text-default-500">Выберите COM-порт для подключения к устройству.</p>

      {!selectedPort && (
        <Alert color="warning" title="COM-порт не выбран">
          Пожалуйста, выберите порт для корректной работы приложения.
        </Alert>
      )}

      <Select
        label="COM-порт"
        placeholder="Выберите порт"
        selectedKeys={selectedPort ? [selectedPort] : []}
        onSelectionChange={(keys) => onSelectPort(Array.from(keys)[0] as string)}
      >
        {ports.map((port) => (
          <SelectItem key={port.path} value={port.path}>
            {port.friendlyName ?? port.path}
          </SelectItem>
        ))}
      </Select>

      <Button variant="flat" onPress={loadPorts}>
        Обновить список портов
      </Button>
    </Card>
  );
};
