import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Input,
  Select,
  SelectItem,
  Slider,
  Switch,
} from '@heroui/react';
import { useTranslation } from 'react-i18next';

import { useAseControl } from '../../../features/ase-control';

export const LightManagement = () => {
  const { t } = useTranslation();

  const {
    ports,
    selectedPort,
    info,
    powerMw,
    enabled,
    lastRaw,
    loading,
    busy,
    isConnected,
    loadPorts,
    selectPort,
    connect,
    disconnect,
    setPowerMw,
    applyPower,
    toggleEmission,
  } = useAseControl();

  const maxPower = info?.maxSetting ?? 0;

  const handleSelectChange = (keys: unknown) => {
    const path = Array.from(keys as Set<string>)[0];
    if (path) selectPort(path);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-4">
      {/* Connection */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{t('lightManagement.title')}</h2>
          <Chip color={isConnected ? 'success' : 'default'} variant="flat">
            {isConnected
              ? t('lightManagement.connection.connected')
              : t('lightManagement.connection.disconnected')}
          </Chip>
        </CardHeader>

        <CardBody className="space-y-4">
          <div className="flex gap-2 items-end">
            <Select
              label={t('lightManagement.connection.port')}
              placeholder={t('lightManagement.connection.selectPort')}
              selectedKeys={selectedPort ? [selectedPort] : []}
              onSelectionChange={handleSelectChange}
              isDisabled={loading || busy || isConnected}
              variant="bordered"
              className="flex-1"
            >
              {ports.map((port) => (
                <SelectItem key={port.path} textValue={port.path}>
                  {port.path}
                  {port.manufacturer ? ` — ${port.manufacturer}` : ''}
                </SelectItem>
              ))}
            </Select>

            <Button variant="flat" onClick={loadPorts} isDisabled={loading || busy || isConnected}>
              {t('lightManagement.connection.refresh')}
            </Button>

            {isConnected ? (
              <Button color="danger" onClick={disconnect} isLoading={busy}>
                {t('lightManagement.connection.disconnect')}
              </Button>
            ) : (
              <Button
                color="primary"
                onClick={connect}
                isDisabled={selectedPort === null}
                isLoading={busy}
              >
                {t('lightManagement.connection.connect')}
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Control */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">{t('lightManagement.control.title')}</h3>
          <Switch
            isSelected={enabled}
            onValueChange={(value) => void toggleEmission(value)}
            isDisabled={!isConnected || busy}
            size="sm"
            color="success"
          >
            {t('lightManagement.control.emission')}
          </Switch>
        </CardHeader>

        <CardBody className="space-y-6">
          {/* Power */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">{t('lightManagement.control.power')}</label>
              <Chip color="primary" variant="flat">
                {powerMw} {t('lightManagement.control.unit')}
              </Chip>
            </div>

            <Slider
              size="sm"
              step={1}
              minValue={0}
              maxValue={maxPower > 0 ? maxPower : 100}
              value={powerMw}
              onChange={(value) => setPowerMw(Number(value))}
              isDisabled={!isConnected || busy}
              color="primary"
              showTooltip
            />

            <div className="flex justify-between text-xs text-gray-500">
              <span>0 {t('lightManagement.control.unit')}</span>
              <span>
                {t('lightManagement.control.max')}: {maxPower} {t('lightManagement.control.unit')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 items-end">
            <Input
              type="number"
              label={t('lightManagement.control.power')}
              value={powerMw.toString()}
              onChange={(e) => setPowerMw(Number(e.target.value))}
              isDisabled={!isConnected || busy}
              min={0}
              max={maxPower > 0 ? maxPower : undefined}
              endContent={
                <span className="text-default-400 text-small">
                  {t('lightManagement.control.unit')}
                </span>
              }
            />

            <Button
              color="primary"
              onClick={applyPower}
              isDisabled={!isConnected || busy}
              isLoading={busy}
            >
              {t('lightManagement.actions.apply')}
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Device info */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">{t('lightManagement.monitoring.title')}</h3>
        </CardHeader>

        <CardBody>
          <div className="grid grid-cols-4 gap-4">
            <Card shadow="sm">
              <CardBody className="text-center space-y-1">
                <p className="text-sm text-gray-500">{t('lightManagement.monitoring.maxSetting')}</p>
                <p className="text-2xl font-bold text-primary">{info?.maxSetting ?? '—'}</p>
              </CardBody>
            </Card>

            <Card shadow="sm">
              <CardBody className="text-center space-y-1">
                <p className="text-sm text-gray-500">{t('lightManagement.monitoring.coeff')}</p>
                <p className="text-2xl font-bold text-secondary">{info?.coeff ?? '—'}</p>
              </CardBody>
            </Card>

            <Card shadow="sm">
              <CardBody className="text-center space-y-1">
                <p className="text-sm text-gray-500">{t('lightManagement.monitoring.unit')}</p>
                <p className="text-2xl font-bold text-warning">{info?.unit ?? '—'}</p>
              </CardBody>
            </Card>

            <Card shadow="sm">
              <CardBody className="text-center space-y-1">
                <p className="text-sm text-gray-500">{t('lightManagement.monitoring.lastRaw')}</p>
                <p className="text-2xl font-bold text-success">{lastRaw ?? '—'}</p>
              </CardBody>
            </Card>
          </div>
        </CardBody>
      </Card>

      <Divider />

      {/* Info */}
      <Card className="bg-blue-50 dark:bg-blue-950">
        <CardBody>
          <h4 className="font-semibold">{t('lightManagement.info.title')}</h4>

          <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-300">
            <li>• {t('lightManagement.info.items.interface')}</li>
            <li>• {t('lightManagement.info.items.power')}</li>
            <li>• {t('lightManagement.info.items.sequence')}</li>
          </ul>
        </CardBody>
      </Card>
    </div>
  );
};
