import { useState } from 'react';
import { Card, CardBody, CardHeader, Button, Switch, Divider } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Download, Upload, Clock } from 'lucide-react';

import { addSuccessToaster, addDangerToaster } from '../../../ui/shared/ui';

export const DatabaseBackupCard = () => {
  const { t } = useTranslation();
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [autoBackup, setAutoBackup] = useState(false);

  const handleCreateBackup = async () => {
    setCreating(true);
    try {
      const result = await window.database.createBackup();

      if (result.success) {
        addSuccessToaster(
          t('database.backup.success'),
          t('database.backup.successDesc', { path: result.path }),
        );
      } else {
        addDangerToaster(t('database.backup.error'), result.error || 'Unknown error');
      }
    } catch (err) {
      addDangerToaster(t('database.backup.error'), String(err));
    } finally {
      setCreating(false);
    }
  };

  const handleRestoreBackup = async () => {
    setRestoring(true);
    try {
      const result = await window.database.restoreBackup();

      if (result.success) {
        addSuccessToaster(
          t('database.backup.restoreSuccess'),
          t('database.backup.restoreSuccessDesc'),
        );
      } else if (!result.cancelled) {
        addDangerToaster(t('database.backup.error'), result.error || 'Unknown error');
      }
    } catch (err) {
      addDangerToaster(t('database.backup.error'), String(err));
    } finally {
      setRestoring(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardHeader className="flex gap-3">
          <div className="p-2 rounded-lg bg-warning-100 dark:bg-warning-900/30">
            <Download className="w-5 h-5 text-warning" />
          </div>
          <div className="flex flex-col">
            <h4 className="text-lg font-semibold">{t('database.backup.title')}</h4>
            <p className="text-sm text-default-500">{t('database.backup.subtitle')}</p>
          </div>
        </CardHeader>

        <Divider />

        <CardBody className="space-y-4">
          {/* Автобэкап */}
          <div className="flex items-center justify-between p-4 bg-default-100 rounded-lg">
            <div className="flex flex-col">
              <span className="text-sm font-medium">{t('database.backup.auto')}</span>
              <span className="text-xs text-default-500">{t('database.backup.autoDesc')}</span>
            </div>
            <Switch
              isSelected={autoBackup}
              onValueChange={setAutoBackup}
              color="success"
              size="sm"
            />
          </div>

          {/* Кнопки */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              color="primary"
              variant="flat"
              startContent={<Download className="w-4 h-4" />}
              onPress={handleCreateBackup}
              isLoading={creating}
              fullWidth
            >
              {t('database.backup.create')}
            </Button>

            <Button
              color="secondary"
              variant="flat"
              startContent={<Upload className="w-4 h-4" />}
              onPress={handleRestoreBackup}
              isLoading={restoring}
              fullWidth
            >
              {t('database.backup.restore')}
            </Button>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};
