import { useEffect, useState } from 'react';
import { Select, SelectItem, Button, Alert, Chip } from '@heroui/react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSerialPortContext } from '../../../app/providers/SerialPortProvider';
import { DataPreview } from './DataPreview';

export default function PortStep({ onNext, onBack }: any) {
  const { t } = useTranslation();
  
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
  } = useSerialPortContext();

  const [localSelected, setLocalSelected] = useState<string | null>(selectedPort || null);

  useEffect(() => {
    if (selectedPort !== localSelected) {
      setLocalSelected(selectedPort);
    }
  }, [selectedPort]);

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

  const handleNext = () => {
    onNext({ lastPort: connectedPort });
  };

  const isNextEnabled = !!connectedPort;
  const isConnectDisabled =
    !localSelected || connecting || disconnecting || loading || connectedPort === localSelected;

  return (
    <div className="space-y-6 w-full">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">{t('onboarding.port.title')}</h2>
        <p className="text-sm text-default-500">{t('onboarding.port.subtitle')}</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 w-full"
      >
        <Select
          label={t('onboarding.port.selectLabel')}
          placeholder={t('onboarding.port.selectPlaceholder')}
          selectedKeys={localSelected ? [localSelected] : []}
          onSelectionChange={handleSelectChange}
          isDisabled={loading || connecting || disconnecting}
          variant="bordered"
          classNames={{
            base: 'w-full',
            trigger: 'w-full',
          }}
        >
          {ports.length === 0 ? (
            <SelectItem key="no-ports" isDisabled>
              {t('onboarding.port.noPorts')}
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
                        {t('onboarding.port.connected')}
                      </Chip>
                    )}
                    {port.busy && port.path !== connectedPort && (
                      <Chip size="sm" color="warning" variant="flat">
                        {t('onboarding.port.busy')}
                      </Chip>
                    )}
                  </div>
                </div>
              </SelectItem>
            ))
          )}
        </Select>

        {error && (
          <Alert color="danger" title={t('common.error')}>
            {error}
          </Alert>
        )}

        {connectedPort && (
          <Alert color="success" title={t('onboarding.port.connectedTitle')}>
            {t('onboarding.port.connectedMessage', { port: connectedPort })}
          </Alert>
        )}

        <div className="flex gap-2 w-full">
          {connectedPort ? (
            <Button
              color="danger"
              variant="solid"
              fullWidth
              isLoading={disconnecting}
              isDisabled={connecting}
              onPress={handleDisconnect}
            >
              {t('onboarding.port.disconnect')}
            </Button>
          ) : (
            <Button
              color="primary"
              variant="solid"
              fullWidth
              isDisabled={isConnectDisabled}
              isLoading={connecting}
              onPress={handleConnect}
            >
              {t('onboarding.port.connect')}
            </Button>
          )}
        </div>

        {connectedPort && (
          <div className="w-full">
            <DataPreview port={connectedPort} />
          </div>
        )}
      </motion.div>

      {/* Навигация */}
      <div className="flex justify-between pt-4 border-t border-default-200">
        <Button variant="light" onPress={onBack} isDisabled={connecting || disconnecting}>
          {t('common.back')}
        </Button>

        <Button
          color="primary"
          onPress={handleNext}
          isDisabled={!isNextEnabled || connecting || disconnecting}
        >
          {t('common.next')}
        </Button>
      </div>
    </div>
  );
}
