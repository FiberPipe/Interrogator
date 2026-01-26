// src/widgets/logs/ui/LogsList.tsx

import { Card, CardBody, Spinner, Button } from '@heroui/react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import type { LogEntry as ILogEntry } from '../../../shared/types/logs';
import { LogEntry } from '../../../shared/ui';

interface LogsListProps {
  logs: ILogEntry[];
  isLoading: boolean;
  error?: string;
  onRetry?: () => void;
}

export const LogsList = ({ logs, isLoading, error, onRetry }: LogsListProps) => {
  if (error) {
    return (
      <Card>
        <CardBody className="p-8 text-center">
          <AlertCircle className="mx-auto mb-4 text-danger" size={48} />
          <p className="text-lg font-semibold mb-2">Failed to load logs</p>
          <p className="text-sm text-default-500 mb-4">{error}</p>
          {onRetry && (
            <Button color="primary" variant="flat" onClick={onRetry}>
              <RefreshCw size={16} />
              Retry
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
            <p className="text-sm text-default-500">Loading logs...</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (logs.length === 0) {
    return (
      <Card>
        <CardBody className="p-8 text-center">
          <p className="text-lg font-semibold mb-2">No logs found</p>
          <p className="text-sm text-default-500">Try adjusting your filters</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {logs.map((log, index) => (
        <LogEntry key={log.id || index} log={log} index={index} />
      ))}
    </div>
  );
};
