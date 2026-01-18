import { Card, CardBody, CardHeader, Chip, Code } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity } from 'lucide-react';
import type { SerialDataPacket } from '../model/types';

interface DataPreviewProps {
  data: SerialDataPacket | null;
  packetsReceived: number;
  dataBuffer: SerialDataPacket[];
}

export const DataPreview = ({ data, packetsReceived, dataBuffer }: DataPreviewProps) => {
  const { t } = useTranslation();

  if (!data) {
    return (
      <Card>
        <CardBody className="text-center text-default-400 py-8">
          <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
          {t('serialPort.dataPreview.noData')}
        </CardBody>
      </Card>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={data.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-success animate-pulse" />
              <h4 className="text-lg font-semibold">
                {t('serialPort.dataPreview.title')}
              </h4>
            </div>
            <Chip color="primary" variant="flat" size="sm">
              {t('serialPort.dataPreview.receivedPackets', { count: packetsReceived })}
            </Chip>
          </CardHeader>
          
          <CardBody className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-default-500">ID:</span>
              <span className="font-mono">{data.id}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-default-500">{t('serialPort.dataPreview.lastUpdate')}:</span>
              <span className="font-mono">{data.time}</span>
            </div>

            <div className="max-h-64 overflow-auto">
              <Code className="w-full">
                <pre className="text-xs">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </Code>
            </div>

            {/* График последних значений */}
            {dataBuffer.length > 1 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-default-500">
                  {t('serialPort.dataPreview.recentValues')} (P0):
                </div>
                <div className="flex gap-1 h-20 items-end">
                  {dataBuffer.slice(-20).map((packet, idx) => {
                    const value = packet.P0 || 0;
                    const height = Math.min(100, (value / 3) * 100);
                    
                    return (
                      <motion.div
                        key={packet.id}
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        className="flex-1 bg-primary rounded-t min-w-[4px]"
                        title={`${value.toFixed(4)}`}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};
