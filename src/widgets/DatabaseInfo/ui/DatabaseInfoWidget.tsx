import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Button, Divider, Chip, Code, Spinner } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Database, FolderOpen, RefreshCw, HardDrive, Clock, Activity, CheckCircle, XCircle } from 'lucide-react';

interface DatabaseInfo {
  path: string;
  exists: boolean;
  size: number;
  sizeFormatted: string;
  userDataPath: string;
  config: {
    location: string;
    filename: string;
    customPath?: string;
  };
  allPossiblePaths: Record<string, string>;
}

interface DatabaseStats {
  totalSessions: number;
  totalRecords: number;
  totalSize: number;
  totalSizeFormatted: string;
  sessions: Array<{
    id: number;
    port: string;
    start_time: number;
    end_time?: number;
    record_count: number;
    status: string;
  }>;
}

export const DatabaseInfoWidget = () => {
  const { t } = useTranslation();
  const [dbInfo, setDbInfo] = useState<DatabaseInfo | null>(null);
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDatabaseInfo = async () => {
    setLoading(true);
    try {
      const [info, stats] = await Promise.all([
        window.database.getPath(),
        window.database.getStats(),
      ]);
      
      setDbInfo(info);
      setDbStats(stats);
    } catch (err) {
      console.error('[DatabaseInfo] Error loading info:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDatabaseInfo();
  }, []);

  const handleOpenFolder = async () => {
    try {
      const path = await window.database.openFolder();
      console.log('[DatabaseInfo] Opened folder:', path);
    } catch (err) {
      console.error('[DatabaseInfo] Error opening folder:', err);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (startTime: number, endTime?: number) => {
    const end = endTime || Date.now();
    const duration = end - startTime;
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  if (loading) {
    return (
      <Card>
        <CardBody className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </CardBody>
      </Card>
    );
  }

  if (!dbInfo) {
    return (
      <Card>
        <CardBody className="text-center py-12">
          <p className="text-default-500">{t('database.info.error')}</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <CardHeader className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
              <Database className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold">{t('database.info.title')}</h3>
              <p className="text-sm text-default-500">{t('database.info.subtitle')}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="flat"
              startContent={<RefreshCw className="w-4 h-4" />}
              onPress={loadDatabaseInfo}
            >
              {t('database.actions.refresh')}
            </Button>
            <Button
              size="sm"
              color="primary"
              variant="flat"
              startContent={<FolderOpen className="w-4 h-4" />}
              onPress={handleOpenFolder}
            >
              {t('database.actions.openFolder')}
            </Button>
          </div>
        </CardHeader>

        <Divider />

        <CardBody className="space-y-6">
          {/* Статус и основная информация */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-default-100">
              <CardBody className="py-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-default-600">{t('database.info.status')}</span>
                  <Chip
                    size="sm"
                    color={dbInfo.exists ? 'success' : 'warning'}
                    variant="flat"
                    startContent={
                      dbInfo.exists ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )
                    }
                  >
                    {dbInfo.exists ? t('database.info.healthy') : t('database.info.notExists')}
                  </Chip>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-default-100">
              <CardBody className="py-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-default-600">{t('database.info.size')}</span>
                  <span className="font-semibold">{dbInfo.sizeFormatted}</span>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-default-100">
              <CardBody className="py-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-default-600">{t('database.info.sessions')}</span>
                  <span className="font-semibold">{dbStats?.totalSessions || 0}</span>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Путь к базе данных */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-default-500" />
              <span className="text-sm font-medium">{t('database.info.path')}:</span>
            </div>
            <Code className="w-full text-xs break-all">{dbInfo.path}</Code>
            
            <div className="space-y-2">
              <p className="text-xs text-default-500">
                {t('database.location.userData')}: 
              </p>
              <Code className="w-full text-xs break-all">{dbInfo.userDataPath}</Code>
            </div>
          </div>

          {/* Конфигурация */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">{t('database.location.title')}</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-default-500">Location Type:</span>
                <p className="font-medium capitalize">{dbInfo.config.location}</p>
              </div>
              <div>
                <span className="text-default-500">Filename:</span>
                <p className="font-medium">{dbInfo.config.filename}</p>
              </div>
            </div>
          </div>

          {/* Последние сессии */}
          {dbStats && dbStats.sessions && dbStats.sessions.length > 0 && (
            <>
              <Divider />
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-default-500" />
                  <span className="text-sm font-medium">
                    {t('database.stats.lastSession')} ({dbStats.sessions.length})
                  </span>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {dbStats.sessions.map((session) => (
                    <Card key={session.id} className="bg-default-50">
                      <CardBody className="py-3 px-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Chip size="sm" variant="flat" color="primary">
                                {session.port}
                              </Chip>
                              <Chip
                                size="sm"
                                color={session.status === 'active' ? 'success' : 'default'}
                                variant="dot"
                              >
                                {session.status}
                              </Chip>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-default-500">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(session.start_time)}
                              </div>
                              <div>
                                {t('database.stats.dataRate')}: {formatDuration(session.start_time, session.end_time)}
                              </div>
                              <div>
                                {t('database.info.records')}: <strong>{session.record_count}</strong>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Все возможные пути */}
          {dbInfo.allPossiblePaths && (
            <>
              <Divider />
              
              <details className="text-sm">
                <summary className="cursor-pointer text-default-600 hover:text-default-900 font-medium">
                  All Possible Locations
                </summary>
                <div className="mt-3 space-y-2 pl-4">
                  {Object.entries(dbInfo.allPossiblePaths).map(([key, path]) => (
                    <div key={key} className="space-y-1">
                      <p className="text-xs font-medium capitalize text-default-600">{key}:</p>
                      <Code className="text-xs break-all">{path}</Code>
                    </div>
                  ))}
                </div>
              </details>
            </>
          )}
        </CardBody>
      </Card>
    </motion.div>
  );
};
