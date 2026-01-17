import { Card, CardBody, Button, Chip } from '@heroui/react';
import { useSerialData } from '../model/useSerialData';

interface DataPreviewProps {
  port: string | null;
}

export const DataPreview = ({ port }: DataPreviewProps) => {
  const { latestData, rawData, recordCount, clear } = useSerialData(port);

  if (!port) {
    return (
      <Card className="bg-gray-50 dark:bg-gray-900">
        <CardBody>
          <p className="text-center text-gray-500 text-sm">
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
            <h4 className="font-semibold">Данные с порта</h4>
          </div>
          
          {recordCount > 0 && (
            <Button size="sm" variant="flat" onPress={clear}>
              Очистить
            </Button>
          )}
        </div>

        {/* JSON данные */}
        {rawData ? (
          <div className="relative">
            <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-auto max-h-64 text-xs font-mono">
              {JSON.stringify(latestData || rawData, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="text-center text-gray-500 text-sm py-4">
            Ожидание данных...
          </div>
        )}
      </CardBody>
    </Card>
  );
};
