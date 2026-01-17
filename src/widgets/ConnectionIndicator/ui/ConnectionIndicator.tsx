import { motion, AnimatePresence } from 'framer-motion';
import { Chip } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { Wifi, WifiOff } from 'lucide-react';
import { useSerialPortContext } from '../../../app/providers/SerialPortProvider';

export const ConnectionIndicator = () => {
  const { t } = useTranslation();
  const { connectedPort, connecting } = useSerialPortContext();

  return (
    <AnimatePresence>
      {(connectedPort || connecting) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="px-4 py-2 bg-default-100 dark:bg-default-50/5 border-b border-default-200"
        >
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              {connecting ? (
                <>
                  <Chip
                    size="sm"
                    variant="flat"
                    color="warning"
                    startContent={<WifiOff className="w-3 h-3" />}
                  >
                    {t('serialPort.status.connecting')}
                  </Chip>
                  <span className="text-xs text-default-500">
                    {t('serialPort.status.connecting')}...
                  </span>
                </>
              ) : (
                <>
                  <Chip
                    size="sm"
                    variant="flat"
                    color="success"
                    startContent={<Wifi className="w-3 h-3" />}
                  >
                    {t('serialPort.status.connected')}
                  </Chip>
                  <span className="text-xs text-default-500">
                    {connectedPort}
                  </span>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
