// src/features/logs/stats/ui/LogsStatsCompact.tsx

import { Card, CardBody, Chip, Skeleton } from '@heroui/react';
import { AlertTriangle, AlertCircle, Info, Bug } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LogsStats } from '../../../../shared/types/logs.types';


interface LogsStatsCompactProps {
  stats: LogsStats | null;
  isLoading?: boolean;
}

export const LogsStatsCompact = ({ stats, isLoading }: LogsStatsCompactProps) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <Card>
        <CardBody className="p-3">
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-20 rounded" />
            <Skeleton className="h-6 w-20 rounded" />
            <Skeleton className="h-6 w-20 rounded" />
            <Skeleton className="h-6 w-20 rounded" />
          </div>
        </CardBody>
      </Card>
    );
  }

  if (!stats) return null;

  const errorCount = stats.byLevel.ERROR || 0;
  const warnCount = stats.byLevel.WARN || 0;
  const infoCount = stats.byLevel.INFO || 0;
  const debugCount = stats.byLevel.DEBUG || 0;
  const total = stats.total;

  return (
    <Card>
      <CardBody className="p-3">
        <div className="flex items-center gap-6 flex-wrap">
          {/* Total */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-default-500">{t('logs.stats.total')}:</span>
            <Chip size="sm" variant="flat" color="default">
              {total.toLocaleString()}
            </Chip>
          </div>

          {/* Errors */}
          {errorCount > 0 && (
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-danger" />
              <Chip size="sm" color="danger" variant="flat">
                {errorCount.toLocaleString()}
              </Chip>
              <span className="text-xs text-default-400">
                ({total > 0 ? ((errorCount / total) * 100).toFixed(1) : 0}%)
              </span>
            </div>
          )}

          {/* Warnings */}
          {warnCount > 0 && (
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-warning" />
              <Chip size="sm" color="warning" variant="flat">
                {warnCount.toLocaleString()}
              </Chip>
              <span className="text-xs text-default-400">
                ({total > 0 ? ((warnCount / total) * 100).toFixed(1) : 0}%)
              </span>
            </div>
          )}

          {/* Info */}
          {infoCount > 0 && (
            <div className="flex items-center gap-2">
              <Info size={16} className="text-primary" />
              <Chip size="sm" color="primary" variant="flat">
                {infoCount.toLocaleString()}
              </Chip>
              <span className="text-xs text-default-400">
                ({total > 0 ? ((infoCount / total) * 100).toFixed(1) : 0}%)
              </span>
            </div>
          )}

          {/* Debug */}
          {debugCount > 0 && (
            <div className="flex items-center gap-2">
              <Bug size={16} className="text-default-500" />
              <Chip size="sm" color="default" variant="flat">
                {debugCount.toLocaleString()}
              </Chip>
              <span className="text-xs text-default-400">
                ({total > 0 ? ((debugCount / total) * 100).toFixed(1) : 0}%)
              </span>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};
