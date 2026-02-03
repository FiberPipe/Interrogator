// src/pages/logs/ui/LogsPage.tsx

import { useEffect } from 'react';
import { Card, CardHeader, Spinner } from '@heroui/react';
import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLogsFilter, LogsFilterCompact } from '../features/log/filter';
import { LogsStatsCompact } from '../features/log/stats';
import { LogsExport } from '../features/log/stats/export';
import { LogsList } from '../widgets/logs/ui/LogsList';
import { useLogsData } from './useLogsData';


export const LogsPage = () => {
  const { t } = useTranslation();
  const { filter, updateFilter, resetFilter } = useLogsFilter();
  const { logs, stats, isLoading, isStatsLoading, error, loadLogs, loadStats, refresh } =
    useLogsData(filter);

  useEffect(() => {
    loadLogs();
    loadStats();
  }, [loadLogs, loadStats]);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-4 space-y-3">
          {/* Compact Header */}
          <Card>
            <CardHeader className="flex flex-row justify-between items-center p-4 gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                  <FileText className="text-primary" size={20} />
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl font-bold truncate">{t('logs.title')}</h1>
                  <p className="text-xs text-default-500 truncate">
                    {t('logs.showingCount', { count: logs.length })} · {t('logs.retention', { days: 3 })}
                  </p>
                </div>
              </div>
              <div className="shrink-0">
                <LogsExport
                  filter={filter}
                  onCleanup={refresh}
                  onClear={refresh}
                  onRefresh={refresh}
                />
              </div>
            </CardHeader>
          </Card>

          {/* Compact Stats */}
          <LogsStatsCompact stats={stats} isLoading={isStatsLoading} />

          {/* Compact Filter Bar */}
          <div className="flex items-center justify-between gap-4">
            <LogsFilterCompact filter={filter} onFilterChange={updateFilter} onReset={resetFilter} />
          </div>

          {/* Results Counter */}
          {!isLoading && !error && (
            <div className="flex justify-between items-center text-xs text-default-500 px-1">
              <span>
                {t('logs.showingCount', { count: logs.length })}
              </span>
            </div>
          )}

          {/* Logs List - занимает основное пространство */}
          <div className="min-h-[400px]">
            <LogsList logs={logs} isLoading={isLoading} error={error} onRetry={loadLogs} />
          </div>
        </div>
      </div>
    </div>
  );
};
