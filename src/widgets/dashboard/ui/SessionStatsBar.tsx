import { useEffect, useState } from 'react';
import { Card, CardBody, Chip } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { Activity, AlertTriangle, Clock, Database, Wifi, WifiOff } from 'lucide-react';

import type { ChannelSummary } from '../hooks/useDashboardChannels';

interface SessionStatsBarProps {
  isConnected: boolean;
  isReceiving: boolean;
  recordCount: number;
  maxRecords: number;
  channels: ChannelSummary[];
  lastUpdate: number | null;
}

type ConnectionState = 'connected' | 'waiting' | 'disconnected';

const formatDuration = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (value: number): string => value.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

export const SessionStatsBar = ({
  isConnected,
  isReceiving,
  recordCount,
  maxRecords,
  channels,
  lastUpdate,
}: SessionStatsBarProps) => {
  const { t } = useTranslation();
  const [sessionStart, setSessionStart] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());

  // Старт/сброс отсчёта длительности сессии при подключении.
  useEffect(() => {
    if (isReceiving && sessionStart === null) {
      setSessionStart(Date.now());
    }
    if (!isConnected) {
      setSessionStart(null);
    }
  }, [isReceiving, isConnected, sessionStart]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const connectionState: ConnectionState = !isConnected
    ? 'disconnected'
    : isReceiving
      ? 'connected'
      : 'waiting';

  const connectionColor = {
    connected: 'success',
    waiting: 'warning',
    disconnected: 'default',
  }[connectionState] as 'success' | 'warning' | 'default';

  const alertCount = channels.filter(
    (channel) => channel.status === 'danger' || channel.status === 'warning',
  ).length;

  const duration = sessionStart !== null ? formatDuration(now - sessionStart) : '00:00:00';

  const lastUpdateLabel =
    lastUpdate !== null ? new Date(lastUpdate).toLocaleTimeString() : '—';

  return (
    <Card shadow="sm">
      <CardBody className="flex flex-row flex-wrap items-center gap-x-8 gap-y-3 py-3">
        <div className="flex items-center gap-2">
          {connectionState === 'connected' ? (
            <Wifi className="w-4 h-4 text-success" />
          ) : (
            <WifiOff className="w-4 h-4 text-default-400" />
          )}
          <Chip size="sm" variant="dot" color={connectionColor}>
            {t(`dashboard.connection.${connectionState}`)}
          </Chip>
        </div>

        <Stat icon={<Clock className="w-4 h-4" />} label={t('dashboard.stats.duration')}>
          {duration}
        </Stat>

        <Stat icon={<Database className="w-4 h-4" />} label={t('dashboard.stats.records')}>
          {recordCount}/{maxRecords}
        </Stat>

        <Stat
          icon={
            <AlertTriangle
              className={`w-4 h-4 ${alertCount > 0 ? 'text-danger' : 'text-default-400'}`}
            />
          }
          label={t('dashboard.stats.alerts')}
        >
          <span className={alertCount > 0 ? 'text-danger font-semibold' : undefined}>
            {alertCount}
          </span>
        </Stat>

        <Stat icon={<Activity className="w-4 h-4" />} label={t('dashboard.stats.lastUpdate')}>
          {lastUpdateLabel}
        </Stat>
      </CardBody>
    </Card>
  );
};

interface StatProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}

const Stat = ({ icon, label, children }: StatProps) => (
  <div className="flex items-center gap-2">
    <span className="text-default-400">{icon}</span>
    <div className="flex flex-col leading-tight">
      <span className="text-[11px] uppercase tracking-wide text-default-400">{label}</span>
      <span className="text-sm font-medium">{children}</span>
    </div>
  </div>
);
