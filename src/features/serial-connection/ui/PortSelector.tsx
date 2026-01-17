import { Select, SelectItem, Chip } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { SerialPortInfo } from '../../../shared/types/global';

interface PortSelectorProps {
  ports: SerialPortInfo[];
  selectedPort: string | null;
  connectedPort: string | null;
  loading: boolean;
  connecting: boolean;
  onPortChange: (port: string) => void;
}

export const PortSelector = ({
  ports,
  selectedPort,
  connectedPort,
  loading,
  connecting,
  onPortChange,
}: PortSelectorProps) => {
  const { t } = useTranslation();

  const handleSelectChange = (keys: any) => {
    const port = Array.from(keys)[0] as string;
    if (port) {
      onPortChange(port);
    }
  };

  return (
    <Select
      label={t('serialPort.selectPort')}
      placeholder={t('serialPort.selectPort')}
      selectedKeys={selectedPort ? [selectedPort] : []}
      onSelectionChange={handleSelectChange}
      isDisabled={loading || connecting}
      variant="bordered"
      description={
        ports.length === 0
          ? t('serialPort.noPorts')
          : t('serialPort.portsFound', { count: ports.length })
      }
      classNames={{
        base: 'w-full',
        trigger: 'w-full',
      }}
    >
      {ports.length === 0 ? (
        <SelectItem key="no-ports" isDisabled>
          {t('serialPort.noPorts')}
        </SelectItem>
      ) : (
        ports.map((port) => (
          <SelectItem
            key={port.path}
            textValue={port.path}
            description={port.manufacturer || t('serialPort.info.unknown')}
            isDisabled={port.busy && port.path !== connectedPort}
          >
            <div className="flex justify-between items-center w-full">
              <div className="flex flex-col">
                <span className="font-medium">{port.path}</span>
                {port.serialNumber && (
                  <span className="text-xs text-default-400">
                    S/N: {port.serialNumber}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {port.path === connectedPort && (
                  <Chip size="sm" color="success" variant="flat">
                    {t('serialPort.status.connected')}
                  </Chip>
                )}
                {port.busy && port.path !== connectedPort && (
                  <Chip size="sm" color="warning" variant="flat">
                    {t('serialPort.status.busy')}
                  </Chip>
                )}
              </div>
            </div>
          </SelectItem>
        ))
      )}
    </Select>
  );
};
