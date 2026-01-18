import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Button, RadioGroup, Radio, Input, Divider } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FolderOpen, HardDrive, FileText, Home, Save } from 'lucide-react';
import { addSuccessToaster, addDangerToaster } from '../../../shared/ui';

export const DatabaseLocationSelector = () => {
  const { t } = useTranslation();
  const [location, setLocation] = useState<string>('userData');
  const [customPath, setCustomPath] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string>('');

  useEffect(() => {
    // Загружаем текущую конфигурацию
    window.database.getPath().then((info) => {
      setLocation(info.config.location);
      setCurrentLocation(info.config.location);
      if (info.config.customPath) {
        setCustomPath(info.config.customPath);
      }
    });
  }, []);

  const handleSelectCustomPath = async () => {
    const path = await window.database.selectCustomPath();
    if (path) {
      setCustomPath(path);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const result = await window.database.changeLocation(
        location as any,
        location === 'custom' ? customPath : undefined
      );
      
      if (result.success) {
        setCurrentLocation(location);
        addSuccessToaster(
          t('database.location.changed'),
          t('database.location.changedDesc')
        );
      } else {
        addDangerToaster(t('database.info.error'), result.error || 'Unknown error');
      }
    } catch (err) {
      console.error('[DatabaseLocationSelector] Error:', err);
      addDangerToaster(t('database.info.error'), String(err));
    } finally {
      setLoading(false);
    }
  };

  const isChanged = location !== currentLocation;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <CardHeader className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-warning-100 dark:bg-warning-900/30">
            <HardDrive className="w-5 h-5 text-warning" />
          </div>
          <div>
            <h3 className="text-lg font-bold">{t('database.location.title')}</h3>
            <p className="text-sm text-default-500">{t('database.location.subtitle')}</p>
          </div>
        </CardHeader>

        <Divider />

        <CardBody className="space-y-4">
          <RadioGroup value={location} onValueChange={setLocation}>
            <Radio value="userData" description={t('database.location.userDataDesc')}>
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                {t('database.location.userData')}
              </div>
            </Radio>

            <Radio value="appPath" description={t('database.location.appPathDesc')}>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {t('database.location.appPath')}
              </div>
            </Radio>

            <Radio value="documents" description={t('database.location.documentsDesc')}>
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                {t('database.location.documents')}
              </div>
            </Radio>

            <Radio value="custom" description={t('database.location.customDesc')}>
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                {t('database.location.custom')}
              </div>
            </Radio>
          </RadioGroup>

          {location === 'custom' && (
            <div className="flex gap-2 mt-4">
              <Input
                value={customPath}
                onChange={(e) => setCustomPath(e.target.value)}
                placeholder={t('database.location.selectFolder')}
                readOnly
                variant="bordered"
              />
              <Button
                variant="flat"
                startContent={<FolderOpen className="w-4 h-4" />}
                onPress={handleSelectCustomPath}
              >
                {t('database.location.browse')}
              </Button>
            </div>
          )}

          {isChanged && (
            <Button
              color="primary"
              fullWidth
              startContent={<Save className="w-4 h-4" />}
              onPress={handleSave}
              isLoading={loading}
              isDisabled={location === 'custom' && !customPath}
            >
              {t('database.location.save')}
            </Button>
          )}
        </CardBody>
      </Card>
    </motion.div>
  );
};
