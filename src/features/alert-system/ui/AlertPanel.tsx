// src/features/alert-system/ui/AlertPanel.tsx
import { Card, CardBody, CardHeader, Chip, Badge, Button, Divider, Tabs, Tab } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, Check, X, AlertTriangle, Info } from 'lucide-react';
import { AlertList } from './AlertList';
import { AlertRuleManager } from './AlertRuleManager';
import { useState } from 'react';
import { useAlertSystem } from '../../../entities/alert/model/useAlertSystem';

export const AlertPanel = () => {
  const { t } = useTranslation();
  const {
    alerts,
    rules,
    statistics,
    isLoading,
    acknowledgeAlert,
    resolveAlert,
    muteAlert,
  } = useAlertSystem();

  const [activeTab, setActiveTab] = useState('alerts');

  const activeAlerts = alerts.filter(a => a.status === 'active');
  const hasActiveAlerts = activeAlerts.length > 0;

  return (
    <Card className="w-full">
      <CardHeader className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="w-6 h-6 text-primary" />
            {hasActiveAlerts && (
              <Badge
                content={activeAlerts.length}
                color="danger"
                placement="top-right"
                size="sm"
              />
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold">{t('alerts.title')}</h3>
            <p className="text-sm text-default-500">{t('alerts.subtitle')}</p>
          </div>
        </div>

        {statistics && (
          <div className="flex gap-2">
            <Chip size="sm" color="danger" variant="flat">
              {statistics.bySeverity.critical} {t('alerts.critical')}
            </Chip>
            <Chip size="sm" color="warning" variant="flat">
              {statistics.bySeverity.warning} {t('alerts.warning')}
            </Chip>
            <Chip size="sm" color="primary" variant="flat">
              {statistics.active} {t('alerts.active')}
            </Chip>
          </div>
        )}
      </CardHeader>

      <Divider />

      <CardBody>
        <Tabs selectedKey={activeTab} onSelectionChange={(key) => setActiveTab(key as string)}>
          <Tab key="alerts" title={t('alerts.tabs.alerts')}>
            <AlertList
              alerts={alerts}
              onAcknowledge={acknowledgeAlert}
              onResolve={resolveAlert}
              onMute={muteAlert}
            />
          </Tab>
          <Tab key="rules" title={t('alerts.tabs.rules')}>
            <AlertRuleManager rules={rules} />
          </Tab>
          <Tab key="history" title={t('alerts.tabs.history')}>
            <AlertList
              alerts={alerts.filter(a => a.status === 'resolved')}
              onAcknowledge={acknowledgeAlert}
              onResolve={resolveAlert}
              onMute={muteAlert}
            />
          </Tab>
        </Tabs>
      </CardBody>
    </Card>
  );
};
