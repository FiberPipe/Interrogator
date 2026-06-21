import { Divider } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

import { DatabaseStatsCards, DatabaseBackupCard, DatabaseExportCard } from '../../../features';
import { DatabaseInfoWidget } from './DatabaseInfoWidget';
import { DatabaseLocationSelector } from './DatabaseLocationSelector';

export const DatabaseManagementWidget = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      {/* Статистика */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-primary rounded-full"></div>
          <h2 className="text-2xl font-bold">{t('database.info.title')}</h2>
        </div>
        <DatabaseStatsCards />
      </motion.section>

      <Divider />

      {/* Информация о БД */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-secondary rounded-full"></div>
          <h2 className="text-2xl font-bold">{t('settings.sections.databaseInfo')}</h2>
        </div>
        <DatabaseInfoWidget />
      </motion.section>

      <Divider />

      {/* Расположение */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-warning rounded-full"></div>
          <h2 className="text-2xl font-bold">{t('settings.sections.databaseLocation')}</h2>
        </div>
        <DatabaseLocationSelector />
      </motion.section>

      <Divider />

      {/* Бэкап и Экспорт */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-success rounded-full"></div>
          <h2 className="text-2xl font-bold">{t('settings.sections.databaseBackup')}</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DatabaseBackupCard />
          <DatabaseExportCard />
        </div>
      </motion.section>
    </div>
  );
};
