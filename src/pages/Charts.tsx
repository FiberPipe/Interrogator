import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Tabs, Tab, Divider } from '@heroui/react';
import { Activity, Zap, Thermometer, Move } from 'lucide-react';

import type { SensorType } from '../entities/sensor-data/model/types';
import { MonitoringDashboard } from '../widgets/monitoring-dashboard';
import { AveragingControl } from '../features/averaging-control';

export const ChartsPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<SensorType>('power');

  const tabs = [
    { key: 'power', label: t('monitoring.tabs.power'), icon: Zap },
    { key: 'wavelength', label: t('monitoring.tabs.wavelength'), icon: Activity },
    { key: 'temperature', label: t('monitoring.tabs.temperature'), icon: Thermometer },
    { key: 'displacement', label: t('monitoring.tabs.displacement'), icon: Move },
  ];

  return (
    <div className="flex flex-col h-full w-full">
      {/* Заголовок */}
      <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t('charts.title')}
          </h1>
          <p className="text-default-500 mt-1">{t('charts.subtitle')}</p>
        </motion.div>

        <AveragingControl />
      </div>

      {/* Табы */}
      <div className="px-6">
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as SensorType)}
          variant="underlined"
          classNames={{
            tabList: 'gap-6 w-full',
            cursor: 'w-full',
            base: 'w-full',
          }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Tab
                key={tab.key}
                title={
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                }
              />
            );
          })}
        </Tabs>
      </div>

      <Divider className="mt-0" />

      {/* Контент на всю ширину */}
      <div className="flex-1 overflow-auto px-6 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full"
          >
            <MonitoringDashboard type={activeTab} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
