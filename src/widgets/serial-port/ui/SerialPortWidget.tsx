import { Card, CardBody, CardHeader, Alert, Divider, Button } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Usb } from 'lucide-react';

import { useSerialPortContext } from '../../../app/providers/SerialPortProvider';
import { PortSelector } from '../../../features/serial-connection/ui/PortSelector';
import { ConnectionControls } from '../../../features/serial-connection/ui/ConnectionControls';
import { DataPreview } from '../../../features/onboarding/ui/DataPreview';

export const SerialPortWidget = () => {
  const { t } = useTranslation();
  const [showDataPreview, setShowDataPreview] = useState(false);

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

  const handleConnect = async () => {
    if (selectedPort) {
      await connectToPort(selectedPort);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex items-center gap-3 pb-0">
        <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
          <Usb className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">{t('serialPort.title')}</h3>
          <p className="text-sm text-default-500">{t('serialPort.description')}</p>
        </div>
      </CardHeader>

      <Divider className="my-4" />

      <CardBody className="space-y-4">
        {/* Статус подключения */}
        {error && (
          <Alert color="danger" title={t('common.error')}>
            {error}
          </Alert>
        )}

        {connectedPort && (
          <Alert color="success" title={t('serialPort.status.connected')}>
            {t('serialPort.alerts.connectedTo')} <strong>{connectedPort}</strong>
          </Alert>
        )}

        {!connectedPort && !selectedPort && (
          <Alert color="warning" title={t('serialPort.alerts.notSelected')}>
            {t('serialPort.alerts.notSelectedDesc')}
          </Alert>
        )}

        {/* Селектор портов */}
        <PortSelector
          ports={ports}
          selectedPort={selectedPort}
          connectedPort={connectedPort}
          loading={loading}
          connecting={connecting || disconnecting}
          onPortChange={handlePortChange}
        />

        {/* Кнопки управления */}
        <ConnectionControls
          selectedPort={selectedPort}
          connectedPort={connectedPort}
          loading={loading}
          connecting={connecting}
          disconnecting={disconnecting}
          onRefresh={loadPorts}
          onConnect={handleConnect}
          onDisconnect={disconnectPort}
        />

        {/* Предварительный просмотр данных */}
        {connectedPort && (
          <>
            <Divider />

            <Button
              variant="light"
              fullWidth
              onPress={() => setShowDataPreview(!showDataPreview)}
              endContent={
                showDataPreview ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )
              }
            >
              {showDataPreview
                ? t('serialPort.buttons.hideData')
                : t('serialPort.buttons.showData')}
            </Button>

            <AnimatePresence>
              {showDataPreview && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <DataPreview port={connectedPort} />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </CardBody>
    </Card>
  );
};
