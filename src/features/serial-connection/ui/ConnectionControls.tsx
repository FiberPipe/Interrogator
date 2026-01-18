import { Button } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { RefreshCw, Plug, Unplug } from 'lucide-react';

interface ConnectionControlsProps {
  selectedPort: string | null;
  connectedPort: string | null;
  loading: boolean;
  connecting: boolean;
  disconnecting: boolean;
  onRefresh: () => void;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const ConnectionControls = ({
  selectedPort,
  connectedPort,
  loading,
  connecting,
  disconnecting,
  onRefresh,
  onConnect,
  onDisconnect,
}: ConnectionControlsProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex gap-2 w-full">
      <Button
        variant="flat"
        onPress={onRefresh}
        isDisabled={loading || connecting || disconnecting}
        isLoading={loading}
        className="flex-1"
        startContent={!loading && <RefreshCw className="w-4 h-4" />}
      >
        {loading ? t('serialPort.buttons.refreshing') : t('serialPort.buttons.refresh')}
      </Button>

      {connectedPort ? (
        <Button
          color="danger"
          variant="solid"
          onPress={onDisconnect}
          isDisabled={connecting || loading}
          isLoading={disconnecting}
          className="flex-1"
          startContent={!disconnecting && <Unplug className="w-4 h-4" />}
        >
          {disconnecting
            ? t('serialPort.buttons.disconnecting')
            : t('serialPort.buttons.disconnect')}
        </Button>
      ) : (
        <Button
          color="primary"
          variant="solid"
          onPress={onConnect}
          isDisabled={!selectedPort || connecting || loading || disconnecting}
          isLoading={connecting}
          className="flex-1"
          startContent={!connecting && <Plug className="w-4 h-4" />}
        >
          {connecting ? t('serialPort.buttons.connecting') : t('serialPort.buttons.connect')}
        </Button>
      )}
    </div>
  );
};
