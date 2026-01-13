import { Card } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import type { SerialPortInfo } from '../model/types';

interface PortInfoProps {
  port: SerialPortInfo;
}

export const PortInfo = ({ port }: PortInfoProps) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <Card className="bg-default-100 p-4">
        <div className="space-y-2 text-sm">
          <div className="font-semibold text-base mb-3">
            {t('serialPort.selectedPort')}
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <span className="text-default-500">{t('serialPort.info.path')}:</span>
            <span className="font-medium">{port.path}</span>
            
            {port.manufacturer && (
              <>
                <span className="text-default-500">{t('serialPort.info.manufacturer')}:</span>
                <span className="font-medium">{port.manufacturer}</span>
              </>
            )}
            
            {port.serialNumber && (
              <>
                <span className="text-default-500">{t('serialPort.info.serialNumber')}:</span>
                <span className="font-medium">{port.serialNumber}</span>
              </>
            )}
            
            {port.vendorId && (
              <>
                <span className="text-default-500">{t('serialPort.info.vendorId')}:</span>
                <span className="font-medium">{port.vendorId}</span>
              </>
            )}
            
            {port.productId && (
              <>
                <span className="text-default-500">{t('serialPort.info.productId')}:</span>
                <span className="font-medium">{port.productId}</span>
              </>
            )}
            
            <span className="text-default-500">{t('serialPort.info.status')}:</span>
            <span className={`font-medium ${port.busy ? 'text-warning' : 'text-success'}`}>
              {port.busy ? t('serialPort.status.busy') : t('serialPort.status.free')}
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
