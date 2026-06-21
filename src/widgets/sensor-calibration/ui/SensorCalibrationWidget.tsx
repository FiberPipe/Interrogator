import { Card, CardBody, CardHeader, Button, Divider, Spinner, Input } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, RotateCcw, Settings2, Download, FolderOpen } from 'lucide-react';

import { useSensorCalibration } from '../../../features/sensor-calibration/model/useSensorCalibration';
import { CalibrationMethodSelector } from '../../../features/sensor-calibration/ui/CalibrationMethodSelector';
import { TableInput } from '../../../features/sensor-calibration/ui/TableInput';
import { FileUpload } from '../../../features/sensor-calibration/ui/FileUpload';
import { CodeEditor } from '../../../features/sensor-calibration/ui/CodeEditor';

export const SensorCalibrationWidget = () => {
  const { t } = useTranslation();
  const {
    method,
    setMethod,
    data,
    filePath,
    isLoading,
    isSaving,
    updateNormalization,
    updateWavelength,
    bulkUpdateData,
    selectFile,
    loadFromCSV,
    loadFromJSON,
    saveConfiguration,
    resetConfiguration,
    exportToJSON,
    exportToCSV,
  } = useSensorCalibration();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-warning-100 dark:bg-warning-900/30">
            <Settings2 className="w-6 h-6 text-warning" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{t('calibration.title')}</h2>
            <p className="text-sm text-default-500">{t('calibration.subtitle')}</p>
          </div>
        </div>
      </motion.div>

      <Divider />

      {/* Путь к файлу данных */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">{t('calibration.dataFile.title')}</h3>
        </CardHeader>
        <Divider />
        <CardBody className="gap-3">
          <div className="flex gap-2">
            <Input
              value={filePath}
              placeholder={t('calibration.dataFile.placeholder')}
              readOnly
              variant="bordered"
              className="flex-1"
            />
            <Button
              color="primary"
              variant="flat"
              startContent={<FolderOpen className="w-4 h-4" />}
              onPress={selectFile}
            >
              {t('calibration.dataFile.select')}
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Выбор метода ввода */}
      <div className="flex justify-between items-center">
        <CalibrationMethodSelector activeMethod={method} onMethodChange={setMethod} />

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="flat"
            startContent={<Download className="w-4 h-4" />}
            onPress={method === 'json' ? exportToJSON : exportToCSV}
          >
            {t('calibration.actions.export')}
          </Button>
        </div>
      </div>

      {/* Контент в зависимости от метода */}
      <AnimatePresence mode="wait">
        <motion.div
          key={method}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {method === 'table' && (
            <Card>
              <CardBody>
                <TableInput
                  data={data}
                  onUpdateNormalization={updateNormalization}
                  onUpdateWavelength={updateWavelength}
                />
              </CardBody>
            </Card>
          )}

          {(method === 'csv' || method === 'json') && (
            <FileUpload method={method} onLoadCSV={loadFromCSV} onLoadJSON={loadFromJSON} />
          )}

          {method === 'code' && <CodeEditor data={data} onUpdate={bulkUpdateData} />}
        </motion.div>
      </AnimatePresence>

      {/* Кнопки действий */}
      <div className="flex gap-3 justify-end">
        <Button
          variant="flat"
          color="warning"
          startContent={<RotateCcw className="w-4 h-4" />}
          onPress={resetConfiguration}
        >
          {t('calibration.actions.reset')}
        </Button>
        <Button
          color="primary"
          startContent={<Save className="w-4 h-4" />}
          onPress={saveConfiguration}
          isLoading={isSaving}
        >
          {t('calibration.actions.save')}
        </Button>
      </div>
    </div>
  );
};
