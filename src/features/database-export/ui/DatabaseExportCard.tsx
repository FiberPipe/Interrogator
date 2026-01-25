import { useState } from 'react';
import { Card, CardBody, CardHeader, Button, Select, SelectItem, Divider } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FileDown } from 'lucide-react';

import { addSuccessToaster, addDangerToaster } from '../../../shared/ui';

const EXPORT_FORMATS = ['csv', 'json', 'sql'];
const TIME_RANGES = ['allData', 'lastHour', 'lastDay', 'lastWeek', 'custom'];

export const DatabaseExportCard = () => {
  const { t } = useTranslation();
  const [exporting, setExporting] = useState(false);
  const [format, setFormat] = useState('csv');
  const [timeRange, setTimeRange] = useState('allData');

  const handleExport = async () => {
    setExporting(true);
    try {
      const result = await window.database.exportData({
        format,
        timeRange,
      });

      if (result.success) {
        addSuccessToaster(
          t('database.export.success'),
          t('database.export.successDesc', { path: result.path }),
        );
      } else {
        addDangerToaster(t('database.export.error'), result.error || 'Unknown error');
      }
    } catch (err) {
      console.error('[DatabaseExport] Error:', err);
      addDangerToaster(t('database.export.error'), String(err));
    } finally {
      setExporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card>
        <CardHeader className="flex gap-3">
          <div className="p-2 rounded-lg bg-success-100 dark:bg-success-900/30">
            <FileDown className="w-5 h-5 text-success" />
          </div>
          <div className="flex flex-col">
            <h4 className="text-lg font-semibold">{t('database.export.title')}</h4>
            <p className="text-sm text-default-500">{t('database.export.subtitle')}</p>
          </div>
        </CardHeader>

        <Divider />

        <CardBody className="space-y-4">
          {/* Формат */}
          <Select
            label={t('database.export.format')}
            selectedKeys={[format]}
            onChange={(e) => setFormat(e.target.value)}
            variant="bordered"
          >
            {EXPORT_FORMATS.map((fmt) => (
              <SelectItem key={fmt} value={fmt}>
                {t(`database.export.${fmt}`)}
              </SelectItem>
            ))}
          </Select>

          {/* Временной диапазон */}
          <Select
            label={t('database.export.timeRange')}
            selectedKeys={[timeRange]}
            onChange={(e) => setTimeRange(e.target.value)}
            variant="bordered"
          >
            {TIME_RANGES.map((range) => (
              <SelectItem key={range} value={range}>
                {t(`database.export.${range}`)}
              </SelectItem>
            ))}
          </Select>

          {/* Кнопка экспорта */}
          <Button
            color="success"
            variant="solid"
            startContent={<FileDown className="w-4 h-4" />}
            onPress={handleExport}
            isLoading={exporting}
            fullWidth
          >
            {t('database.export.export')}
          </Button>
        </CardBody>
      </Card>
    </motion.div>
  );
};
