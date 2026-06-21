import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Tab, Tabs } from '@heroui/react';

import { useSerialPortContext } from '../app/providers/SerialPortProvider';
import { useSerialData } from '../widgets/monitoring-dashboard/hooks/useSerialData';
import {
  ChannelOverviewGrid,
  HistoricalPanel,
  SessionStatsBar,
  useDashboardChannels,
} from '../widgets/dashboard';
import { DashboardSettingsPanel, useDashboardSettings } from '../features/dashboard-settings';

const MAX_RECORDS = 200;

type DashboardMode = 'live' | 'history';

export const DashboardPage = () => {
  const { t } = useTranslation();
  const { connectedPort } = useSerialPortContext();
  const { dataBuffer, latestData, isReceiving } = useSerialData(connectedPort);

  const channels = useDashboardChannels(dataBuffer, latestData);
  const { columns, visibleChannels, changeColumns, toggleChannel } = useDashboardSettings();

  const [mode, setMode] = useState<DashboardMode>('live');
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);

  useEffect(() => {
    if (latestData !== null) setLastUpdate(Date.now());
  }, [latestData]);

  const isConnected = connectedPort !== null;

  return (
    <div className="flex flex-col h-full w-full overflow-auto">
      <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t('dashboard.title')}
          </h1>
          <p className="text-default-500 mt-1">{t('dashboard.subtitle')}</p>
        </motion.div>

        {mode === 'live' && (
          <DashboardSettingsPanel
            columns={columns}
            visibleChannels={visibleChannels}
            onColumnsChange={changeColumns}
            onToggleChannel={toggleChannel}
          />
        )}
      </div>

      <div className="px-6">
        <Tabs
          selectedKey={mode}
          onSelectionChange={(key) => setMode(key as DashboardMode)}
          variant="underlined"
        >
          <Tab key="live" title={t('dashboard.mode.live')} />
          <Tab key="history" title={t('dashboard.mode.history')} />
        </Tabs>
      </div>

      <div className="px-6 py-6 space-y-4">
        {mode === 'live' ? (
          <>
            <SessionStatsBar
              isConnected={isConnected}
              isReceiving={isReceiving}
              recordCount={dataBuffer.length}
              maxRecords={MAX_RECORDS}
              channels={channels}
              lastUpdate={lastUpdate}
            />

            <ChannelOverviewGrid
              channels={channels}
              isConnected={isConnected}
              columns={columns}
              visibleChannels={visibleChannels}
            />
          </>
        ) : (
          <HistoricalPanel port={connectedPort} />
        )}
      </div>
    </div>
  );
};
