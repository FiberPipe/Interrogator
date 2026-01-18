import { Card, CardBody, Button } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { Upload, FileText, FileJson } from 'lucide-react';
import { useCallback } from 'react';
import type { CalibrationMethod } from '../model/types';

interface FileUploadProps {
  method: CalibrationMethod;
  onLoadCSV: (file: File) => void;
  onLoadJSON: (file: File) => void;
}

export const FileUpload = ({ method, onLoadCSV, onLoadJSON }: FileUploadProps) => {
  const { t } = useTranslation();

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (method === 'csv') {
        onLoadCSV(file);
      } else if (method === 'json') {
        onLoadJSON(file);
      }

      e.target.value = '';
    },
    [method, onLoadCSV, onLoadJSON]
  );

  const acceptedFormats = method === 'csv' ? '.csv' : '.json';
  const Icon = method === 'csv' ? FileText : FileJson;

  return (
    <Card className="border-2 border-dashed border-default-300">
      <CardBody className="flex flex-col items-center justify-center gap-4 py-12">
        <div className="p-4 rounded-full bg-primary-100 dark:bg-primary-900/30">
          <Icon className="w-12 h-12 text-primary" />
        </div>

        <div className="text-center">
          <h4 className="text-lg font-semibold mb-1">
            {t(`calibration.upload.${method}Title`)}
          </h4>
          <p className="text-sm text-default-500">
            {t(`calibration.upload.${method}Description`)}
          </p>
        </div>

        <label htmlFor="calibration-file-upload">
          <input
            id="calibration-file-upload"
            type="file"
            accept={acceptedFormats}
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            as="span"
            color="primary"
            startContent={<Upload className="w-4 h-4" />}
          >
            {t('calibration.upload.selectFile')}
          </Button>
        </label>

        <p className="text-xs text-default-400">
          {t('calibration.upload.acceptedFormats')}: {acceptedFormats}
        </p>
      </CardBody>
    </Card>
  );
};
