import { useEffect, useState, useCallback } from 'react';
import { SerialPortInfo } from '../model';
import { addSuccessToaster, addDangerToaster } from '../../../shared/ui';

export const useComPort = () => {
  const [ports, setPorts] = useState<SerialPortInfo[]>([]);
  const [selectedPort, setSelectedPort] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadSavedPort = useCallback(async () => {
    try {
      const savedData = await window.appData.getAll();
      if (savedData?.selectedPort) {
        setSelectedPort(savedData.selectedPort as string);
      }
    } catch (err) {
      console.error('Ошибка загрузки сохранённого порта:', err);
      addDangerToaster('Ошибка загрузки порта', String(err));
    }
  }, []);

  const loadPorts = useCallback(async () => {
    setLoading(true);
    try {
      const list = await window.serial.getPorts();
      setPorts(list);
      if (selectedPort && !list.find((p) => p.path === selectedPort)) {
        setSelectedPort(null);
      }
    } catch (err) {
      console.error('Ошибка получения списка портов:', err);
      addDangerToaster('Ошибка получения портов', String(err));
    } finally {
      setLoading(false);
    }
  }, [selectedPort]);

  const handlePortChange = useCallback(async (port: string) => {
    setSelectedPort(port);
    try {
      await window.appData.set('selectedPort', port);
      addSuccessToaster('Порт сохранён', `Выбран порт ${port}`);
    } catch (err) {
      console.error('Ошибка сохранения порта:', err);
      addDangerToaster('Ошибка сохранения порта', String(err));
    }
  }, []);

  useEffect(() => {
    loadSavedPort();
    loadPorts();
  }, [loadSavedPort, loadPorts]);

  return {
    ports,
    selectedPort,
    loading,
    loadPorts,
    handlePortChange,
  };
};
