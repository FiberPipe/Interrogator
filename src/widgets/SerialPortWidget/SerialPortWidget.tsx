import { Card, CardBody, CardHeader, Alert, Spinner, Button, Divider } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useSerialConnection } from '../../features/serial-connection/model/useSerialConnection';
import { PortSelector } from '../../features/serial-connection/ui/PortSelector';
import { AutoConnectSwitch } from '../../features/serial-connection/ui/AutoConnectionSwitch';
import { ConnectionControls } from '../../features/serial-connection/ui/ConnectionControls';
import { DataPreview, PortInfo } from '../../entities/serial-port';

export const SerialPortWidget = () => {
    const { t } = useTranslation();
    const [showDataPreview, setShowDataPreview] = useState(true);

    const {
        ports,
        selectedPort,
        connectedPort,
        loading,
        connecting,
        error,
        autoConnect,
        lastData,
        dataBuffer,
        packetsReceived,
        loadPorts,
        handlePortChange,
        connectToPort,
        disconnectPort,
        setAutoConnect,
    } = useSerialConnection();

    const handleConnect = () => {
        if (selectedPort) {
            connectToPort(selectedPort);
        }
    };

    const selectedPortInfo = ports.find((p) => p.path === selectedPort);

    return (
        <Card className="w-full">
            <CardHeader className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold">{t('serialPort.title')}</h3>
                    {loading && <Spinner size="sm" />}
                </div>
            </CardHeader>

            <CardBody className="space-y-4">
                <p className="text-sm text-default-500">
                    {t('serialPort.description')}
                </p>

                {/* Статус подключения */}
                {connectedPort ? (
                    <Alert color="success" title={t('serialPort.status.connected')}>
                        {t('serialPort.alerts.connectedTo')} <strong>{connectedPort}</strong>
                    </Alert>
                ) : !selectedPort ? (
                    <Alert color="warning" title={t('serialPort.alerts.notSelected')}>
                        {t('serialPort.alerts.notSelectedDesc')}
                    </Alert>
                ) : null}

                {/* Ошибка */}
                {error && (
                    <Alert color="danger" title={t('serialPort.alerts.error')}>
                        {error}
                    </Alert>
                )}

                {/* Селектор портов */}
                <PortSelector
                    ports={ports}
                    selectedPort={selectedPort}
                    connectedPort={connectedPort}
                    loading={loading}
                    connecting={connecting}
                    onPortChange={handlePortChange}
                />

                {/* Автоподключение */}
                <AutoConnectSwitch value={autoConnect} onChange={setAutoConnect} />

                {/* Кнопки управления */}
                <ConnectionControls
                    selectedPort={selectedPort}
                    connectedPort={connectedPort}
                    loading={loading}
                    connecting={connecting}
                    autoConnect={autoConnect}
                    onRefresh={loadPorts}
                    onConnect={handleConnect}
                    onDisconnect={disconnectPort}
                />

                {/* Информация о выбранном порте */}
                {selectedPortInfo && <PortInfo port={selectedPortInfo} />}

                {/* Предварительный просмотр данных */}
                {connectedPort && (
                    <>
                        <Divider />

                        <Button
                            variant="light"
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
                                <DataPreview
                                    data={lastData}
                                    packetsReceived={packetsReceived}
                                    dataBuffer={dataBuffer}
                                />
                            )}
                        </AnimatePresence>
                    </>
                )}
            </CardBody>
        </Card>
    );
};
