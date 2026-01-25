import { Card, CardBody, Button, Chip } from '@heroui/react';
import { useTranslation } from 'react-i18next';

import { useSerialData } from '../model/useSerialData';

interface DataPreviewProps {
  port: string | null;
}

export const DataPreview = ({ port }: DataPreviewProps) => {
  const { t } = useTranslation();
  const { latestData, rawData, recordCount, clear } = useSerialData(port);

  if (!port) {
    return (
      <Card className="bg-default-50 dark:bg-default-100/5">
        <CardBody>
          <p className="text-center text-default-500 text-sm py-4">
            {t('dataPreview.connectHint')}
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody className="gap-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm">{t('dataPreview.title')}</h4>
            <Chip size="sm" variant="dot" color={recordCount > 0 ? 'success' : 'default'}>
              {t('dataPreview.records', { count: recordCount })}
            </Chip>
          </div>

          {recordCount > 0 && (
            <Button size="sm" variant="flat" onPress={clear}>
              {t('dataPreview.clear')}
            </Button>
          )}
        </div>

        {rawData ? (
          <div className="relative">
            <pre className="bg-content2 p-3 rounded-lg overflow-auto max-h-48 text-xs font-mono">
              {JSON.stringify(latestData || rawData, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="text-center text-default-400 text-sm py-8 border-2 border-dashed border-default-200 rounded-lg">
            {t('dataPreview.waiting')}
          </div>
        )}
      </CardBody>
    </Card>
  );
};
