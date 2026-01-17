import { Card, CardBody, Button, Chip } from '@heroui/react';
import { useSerialData } from '../model/useSerialData';

interface DataPreviewProps {
  port: string | null;
}

export const DataPreview = ({ port }: DataPreviewProps) => {
  const { latestData, rawData, recordCount, clear } = useSerialData(port);

  if (!port) {
    return (
      <Card className="bg-default-50 dark:bg-default-100/5">
        <CardBody>
          <p className="text-center text-default-500 text-sm py-4">
            Подключитесь к порту для просмотра данных
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
            <h4 className="font-semibold text-sm">Данные с порта</h4>
            <Chip size="sm" variant="dot" color={recordCount > 0 ? 'success' : 'default'}>
              {recordCount} записей
            </Chip>
          </div>

          {recordCount > 0 && (
            <Button size="sm" variant="flat" onPress={clear}>
              Очистить
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
            Ожидание данных...
          </div>
        )}
      </CardBody>
    </Card>
  );
};
