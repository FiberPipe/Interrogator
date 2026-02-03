// src/features/logs/stats/ui/LogsStats.tsx

import { Card, CardBody, Chip, Progress } from '@heroui/react';
import { TrendingUp, Database, Clock, AlertTriangle, Bug, AlertCircle, Info } from 'lucide-react';
import { format } from 'date-fns';
import { LogLevelBadge } from '../../../../shared/ui/log-level-badge/LogLevelBadge';
import { LogsStats as ILogsStats} from '../../../../shared/types/logs.types';


interface LogsStatsProps {
  stats: ILogsStats | null;
  isLoading?: boolean;
  compact?: boolean;
}

export const LogsStats = ({ stats, isLoading, compact = false }: LogsStatsProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardBody className="p-3">
          <div className="animate-pulse flex gap-4">
            <div className="h-6 bg-default-200 rounded w-20"></div>
            <div className="h-6 bg-default-200 rounded w-20"></div>
            <div className="h-6 bg-default-200 rounded w-20"></div>
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

  if (compact) {
    return (
      <Card>
        <CardBody className="p-3">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm text-default-500">Total:</span>
              <Chip size="sm" variant="flat">{total}</Chip>
            </div>
            {errorCount > 0 && (
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-danger" />
                <Chip size="sm" color="danger" variant="flat">
                  {errorCount}
                </Chip>
              </div>
            )}
            {warnCount > 0 && (
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-warning" />
                <Chip size="sm" color="warning" variant="flat">
                  {warnCount}
                </Chip>
              </div>
            )}
            {infoCount > 0 && (
              <div className="flex items-center gap-2">
                <Info size={16} className="text-primary" />
                <Chip size="sm" color="primary" variant="flat">
                  {infoCount}
                </Chip>
              </div>
            )}
            {debugCount > 0 && (
              <div className="flex items-center gap-2">
                <Bug size={16} className="text-default-500" />
                <Chip size="sm" color="default" variant="flat">
                  {debugCount}
                </Chip>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    );
  }


  const totalLogs = stats.total;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      {/* Total Logs */}
      <Card>
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-default-500 mb-1">Total Logs</p>
              <p className="text-2xl font-bold">{totalLogs.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <Database className="text-primary" size={24} />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Errors */}
      <Card>
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-default-500 mb-1">Errors</p>
              <p className="text-2xl font-bold text-danger">{errorCount.toLocaleString()}</p>
              {totalLogs > 0 && (
                <p className="text-xs text-default-400 mt-1">
                  {((errorCount / totalLogs) * 100).toFixed(1)}%
                </p>
              )}
            </div>
            <div className="p-3 bg-danger/10 rounded-lg">
              <AlertTriangle className="text-danger" size={24} />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Warnings */}
      <Card>
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-default-500 mb-1">Warnings</p>
              <p className="text-2xl font-bold text-warning">{warnCount.toLocaleString()}</p>
              {totalLogs > 0 && (
                <p className="text-xs text-default-400 mt-1">
                  {((warnCount / totalLogs) * 100).toFixed(1)}%
                </p>
              )}
            </div>
            <div className="p-3 bg-warning/10 rounded-lg">
              <TrendingUp className="text-warning" size={24} />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Time Range */}
      <Card>
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-sm text-default-500 mb-1">Time Range</p>
              {stats.oldestLog && stats.newestLog ? (
                <div className="text-xs space-y-1">
                  <p className="text-default-600 truncate">
                    From: {format(new Date(stats.oldestLog), 'dd.MM HH:mm')}
                  </p>
                  <p className="text-default-600 truncate">
                    To: {format(new Date(stats.newestLog), 'dd.MM HH:mm')}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-default-400">No logs</p>
              )}
            </div>
            <div className="p-3 bg-success/10 rounded-lg">
              <Clock className="text-success" size={24} />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Distribution */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardBody className="p-4">
          <p className="text-sm font-semibold mb-3">Log Level Distribution</p>
          <div className="space-y-3">
            {/* ERROR */}
            {errorCount > 0 && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <LogLevelBadge level="ERROR" />
                  <span className="text-sm text-default-500">
                    {errorCount} ({totalLogs > 0 ? ((errorCount / totalLogs) * 100).toFixed(1) : 0}
                    %)
                  </span>
                </div>
                <Progress
                  value={totalLogs > 0 ? (errorCount / totalLogs) * 100 : 0}
                  color="danger"
                  size="sm"
                />
              </div>
            )}

            {/* WARN */}
            {warnCount > 0 && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <LogLevelBadge level="WARN" />
                  <span className="text-sm text-default-500">
                    {warnCount} ({totalLogs > 0 ? ((warnCount / totalLogs) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
                <Progress
                  value={totalLogs > 0 ? (warnCount / totalLogs) * 100 : 0}
                  color="warning"
                  size="sm"
                />
              </div>
            )}

            {/* INFO */}
            {infoCount > 0 && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <LogLevelBadge level="INFO" />
                  <span className="text-sm text-default-500">
                    {infoCount} ({totalLogs > 0 ? ((infoCount / totalLogs) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
                <Progress
                  value={totalLogs > 0 ? (infoCount / totalLogs) * 100 : 0}
                  color="primary"
                  size="sm"
                />
              </div>
            )}

            {/* DEBUG */}
            {debugCount > 0 && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <LogLevelBadge level="DEBUG" />
                  <span className="text-sm text-default-500">
                    {debugCount} ({totalLogs > 0 ? ((debugCount / totalLogs) * 100).toFixed(1) : 0}
                    %)
                  </span>
                </div>
                <Progress
                  value={totalLogs > 0 ? (debugCount / totalLogs) * 100 : 0}
                  color="default"
                  size="sm"
                />
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
