import { Card, CardBody, Skeleton } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { HardDrive, Activity, Database, Clock } from 'lucide-react';
import { useDatabaseStats } from '../model/useDatabaseStats';

export const DatabaseStatsCards = () => {
  const { t } = useTranslation();
  const { stats, loading } = useDatabaseStats();

  const statsCards = [
    {
      icon: HardDrive,
      label: t('database.stats.totalSize'),
      value: stats?.totalSizeFormatted || '0 Bytes',
      color: 'primary',
    },
    {
      icon: Database,
      label: t('database.stats.totalSessions'),
      value: stats?.totalSessions || 0,
      color: 'secondary',
    },
    {
      icon: Activity,
      label: t('database.stats.totalRecords'),
      value: stats?.totalRecords || 0,
      color: 'success',
    },
    {
      icon: Clock,
      label: t('database.stats.activeSessions'),
      value: stats?.activeSessions || 0,
      color: 'warning',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsCards.map((stat, idx) => {
        const Icon = stat.icon;
        
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardBody className="p-4">
                {loading ? (
                  <Skeleton className="h-20 rounded-lg" />
                ) : (
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/30`}>
                      <Icon className={`w-6 h-6 text-${stat.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-default-500">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};
