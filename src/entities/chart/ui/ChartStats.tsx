import { Card, CardBody, Chip } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { Activity, Database, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChartStatsProps {
  isReceiving: boolean;
  bufferSize: number;
  maxBuffer: number;
  recordId?: string;
  time?: string;
  average?: number;
  connectedPort?: string | null;
}

export const ChartStats = ({
  isReceiving,
  bufferSize,
  maxBuffer,
  recordId,
  time,
  average,
  connectedPort,
}: ChartStatsProps) => {
  const { t } = useTranslation();

  const stats = [
    {
      icon: Activity,
      label: t('charts.status.receiving'),
      value: isReceiving ? '✅' : '❌',
      color: isReceiving ? 'success' : 'default',
    },
    {
      icon: Database,
      label: t('charts.info.buffer'),
      value: `${bufferSize}/${maxBuffer}`,
      color: bufferSize === maxBuffer ? 'warning' : 'primary',
    },
    ...(recordId
      ? [
          {
            icon: Clock,
            label: t('charts.info.record'),
            value: `#${recordId}`,
            color: 'secondary' as const,
          },
        ]
      : []),
    ...(average !== undefined
      ? [
          {
            icon: TrendingUp,
            label: t('charts.power.average'),
            value: `${average.toFixed(3)} W`,
            color: 'success' as const,
          },
        ]
      : []),
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="shadow-sm">
              <CardBody className="p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/30`}
                  >
                    <Icon className={`w-4 h-4 text-${stat.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-default-500 truncate">{stat.label}</p>
                    <p className="text-sm font-semibold truncate">{stat.value}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};
