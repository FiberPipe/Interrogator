import { useEffect, useState } from 'react';
import { Card, Select, SelectItem, Button, Alert } from '@heroui/react';
import { SerialPortInfo, getPorts } from '../model';


export const ComPortSelector = () => {
  const [ports, setPorts] = useState<SerialPortInfo[]>([]);
  const [selectedPort, setSelectedPort] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadPorts = async () => {
    setLoading(true);
    try {
      const list = await getPorts();
      setPorts(list);
      if (selectedPort && !list.find((p) => p.path === selectedPort)) {
        setSelectedPort('');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPorts();
  }, []);

  console.log(window.serial)

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
        onSelectionChange={(keys) => onSelectPort(Array.from(keys)[0] as string)}
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
