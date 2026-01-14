import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button, Divider } from '@heroui/react';
import { LineChart, Table } from 'lucide-react';

import { PowerTableWidget } from '../widgets/PowerTable/ui/PowerTableWidget';
import { PowerChartWidget } from '../widgets';

type ViewMode = 'chart' | 'table';

export const Charts = () => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<ViewMode>('chart');

  return (
    <div className="flex flex-col h-full p-6 max-w-[1920px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t('charts.title')}
          </h1>
          <p className="text-default-500 mt-1">{t('charts.subtitle')}</p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2 p-1 bg-default-100 rounded-lg">
          <Button
            size="sm"
            variant={viewMode === 'chart' ? 'solid' : 'light'}
            color={viewMode === 'chart' ? 'primary' : 'default'}
            startContent={<LineChart className="w-4 h-4" />}
            onPress={() => setViewMode('chart')}
          >
            {t('charts.types.chart')}
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'table' ? 'solid' : 'light'}
            color={viewMode === 'table' ? 'primary' : 'default'}
            startContent={<Table className="w-4 h-4" />}
            onPress={() => setViewMode('table')}
          >
            {t('charts.types.table')}
          </Button>
        </div>
      </motion.div>

      <Divider className="mb-6" />

      <div className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          {viewMode === 'chart' ? (
            <motion.div
              key="chart"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <PowerChartWidget />
            </motion.div>
          ) : (
            <motion.div
              key="table"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <PowerTableWidget />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
