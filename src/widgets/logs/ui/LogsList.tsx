// src/widgets/logs/ui/LogsList/LogsList.tsx

import { Card, CardBody, Spinner, Button } from '@heroui/react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { LogEntry } from '../../../entities/log';
import { LogEntry as LogEntryType } from '../../../shared/types/logs.types';

interface LogsListProps {
  logs: LogEntryType[];
  isLoading: boolean;
  error?: string;
  onRetry?: () => void;
}

export const LogsList = ({ logs, isLoading, error, onRetry }: LogsListProps) => {
  const { t } = useTranslation();

  if (error) {
    return (
      <Card>
        <CardBody className="p-8 text-center">
          <AlertCircle className="mx-auto mb-4 text-danger" size={48} />
          <p className="text-lg font-semibold mb-2">{t('logs.list.error')}</p>
          <p className="text-sm text-default-500 mb-4">{error}</p>
          {onRetry && (
            <Button color="primary" variant="flat" onClick={onRetry}>
              <RefreshCw size={16} />
              {t('logs.list.retry')}
            </Button>
          )}
        </CardBody>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardBody className="p-8">
          <div className="flex flex-col items-center justify-center gap-4">
            <Spinner size="lg" />
            <p className="text-sm text-default-500">{t('logs.list.loading')}</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (logs.length === 0) {
    return (
      <Card>
        <CardBody className="p-8 text-center">
          <p className="text-lg font-semibold mb-2">{t('logs.list.noLogs')}</p>
          <p className="text-sm text-default-500">{t('logs.list.noLogsHint')}</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {logs.map((log, index) => (
        <LogEntry key={log.id || `${log.timestamp}-${index}`} log={log} index={index} />
      ))}
    </div>
  );
};
