// src/features/alert-system/model/useAlertSystem.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { Alert, AlertRule, AlertStatistics } from '../../../entities/alert/model/types';
import { alertDatabase } from '../lib/alert-database';
import { alertSoundManager } from '../lib/alert-sound-manager';

export const useAlertSystem = () => {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [statistics, setStatistics] = useState<AlertStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const alertQueueRef = useRef<Alert[]>([]);
  const processingRef = useRef(false);

  // Загрузка правил и истории алертов
  useEffect(() => {
    const loadData = async () => {
      try {
        const [savedRules, recentAlerts] = await Promise.all([
          alertDatabase.getRules(),
          alertDatabase.getAlerts({ limit: 100 }),
        ]);

        setRules(savedRules);
        setAlerts(recentAlerts);
        updateStatistics(recentAlerts);
      } catch (err) {
        console.error('[AlertSystem] Load error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Обновление статистики
  const updateStatistics = useCallback((alertList: Alert[]) => {
    const stats: AlertStatistics = {
      total: alertList.length,
      active: alertList.filter(a => a.status === 'active').length,
      acknowledged: alertList.filter(a => a.status === 'acknowledged').length,
      resolved: alertList.filter(a => a.status === 'resolved').length,
      bySeverity: {
        info: alertList.filter(a => a.severity === 'info').length,
        warning: alertList.filter(a => a.severity === 'warning').length,
        critical: alertList.filter(a => a.severity === 'critical').length,
      },
      bySensor: {},
      lastAlert: alertList[0],
    };

    alertList.forEach(alert => {
      stats.bySensor[alert.sensor] = (stats.bySensor[alert.sensor] || 0) + 1;
    });

    setStatistics(stats);
  }, []);

  // Создание нового алерта
  const createAlert = useCallback(async (
    sensor: string,
    severity: AlertSeverity,
    message: string,
    value?: number,
    threshold?: { min?: number; max?: number }
  ) => {
    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      severity,
      status: 'active',
      sensor,
      type: 'threshold',
      message,
      value,
      threshold,
    };

    alertQueueRef.current.push(alert);
    processAlertQueue();

    return alert;
  }, []);

  // Обработка очереди алертов
  const processAlertQueue = useCallback(async () => {
    if (processingRef.current || alertQueueRef.current.length === 0) return;

    processingRef.current = true;

    while (alertQueueRef.current.length > 0) {
      const alert = alertQueueRef.current.shift()!;

      // Находим применимые правила
      const applicableRules = rules.filter(
        rule => rule.enabled && rule.sensor === alert.sensor
      );

      // Выполняем действия
      for (const rule of applicableRules) {
        for (const action of rule.actions) {
          await executeAlertAction(action, alert);
        }
      }

      // Сохраняем в БД
      await alertDatabase.saveAlert(alert);

      // Обновляем состояние
      setAlerts(prev => [alert, ...prev]);
      updateStatistics([alert, ...alerts]);
    }

    processingRef.current = false;
  }, [rules, alerts, updateStatistics]);

  // Выполнение действий алерта
  const executeAlertAction = async (
    action: AlertAction,
    alert: Alert
  ) => {
    try {
      switch (action.type) {
        case 'sound':
          await alertSoundManager.play(
            action.config?.soundFile || 'default',
            action.config?.volume || 0.5
          );
          break;

        case 'desktop_notification':
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(
              action.config?.notificationTitle || 'Alert',
              {
                body: action.config?.notificationBody || alert.message,
                icon: '/icon.png',
                tag: alert.id,
              }
            );
          }
          break;

        case 'snapshot':
          // Сохранение снимка данных
          await window.database.createSnapshot(alert.timestamp);
          break;

        case 'log':
          console.log(`[Alert] ${alert.severity.toUpperCase()}: ${alert.message}`);
          break;

        default:
          console.warn('[AlertSystem] Unknown action type:', action.type);
      }
    } catch (err) {
      console.error('[AlertSystem] Action execution error:', err);
    }
  };

  // Подтверждение алерта
  const acknowledgeAlert = useCallback(async (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return;

    const updated = {
      ...alert,
      status: 'acknowledged' as const,
      acknowledgedAt: Date.now(),
    };

    await alertDatabase.updateAlert(updated);
    setAlerts(prev => prev.map(a => a.id === alertId ? updated : a));
    updateStatistics(alerts.map(a => a.id === alertId ? updated : a));
  }, [alerts, updateStatistics]);

  // Разрешение алерта
  const resolveAlert = useCallback(async (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return;

    const updated = {
      ...alert,
      status: 'resolved' as const,
      resolvedAt: Date.now(),
    };

    await alertDatabase.updateAlert(updated);
    setAlerts(prev => prev.map(a => a.id === alertId ? updated : a));
    updateStatistics(alerts.map(a => a.id === alertId ? updated : a));
  }, [alerts, updateStatistics]);

  // Отключение звука для алерта
  const muteAlert = useCallback(async (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return;

    const updated = {
      ...alert,
      status: 'muted' as const,
    };

    await alertDatabase.updateAlert(updated);
    setAlerts(prev => prev.map(a => a.id === alertId ? updated : a));
  }, [alerts]);

  // Управление правилами
  const createRule = useCallback(async (rule: Omit<AlertRule, 'id'>) => {
    const newRule: AlertRule = {
      ...rule,
      id: `rule_${Date.now()}`,
    };

    await alertDatabase.saveRule(newRule);
    setRules(prev => [...prev, newRule]);
  }, []);

  const updateRule = useCallback(async (ruleId: string, updates: Partial<AlertRule>) => {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;

    const updated = { ...rule, ...updates };
    await alertDatabase.updateRule(updated);
    setRules(prev => prev.map(r => r.id === ruleId ? updated : r));
  }, [rules]);

  const deleteRule = useCallback(async (ruleId: string) => {
    await alertDatabase.deleteRule(ruleId);
    setRules(prev => prev.filter(r => r.id !== ruleId));
  }, []);

  // Очистка старых алертов
  const clearOldAlerts = useCallback(async (olderThan: number) => {
    await alertDatabase.clearAlerts(olderThan);
    const recentAlerts = await alertDatabase.getAlerts({ limit: 100 });
    setAlerts(recentAlerts);
    updateStatistics(recentAlerts);
  }, [updateStatistics]);

  return {
    alerts,
    rules,
    statistics,
    isLoading,
    createAlert,
    acknowledgeAlert,
    resolveAlert,
    muteAlert,
    createRule,
    updateRule,
    deleteRule,
    clearOldAlerts,
  };
};
