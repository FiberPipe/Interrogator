// src/entities/alert/model/types.ts
export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'muted';

export interface Alert {
  id: string;
  timestamp: number;
  severity: AlertSeverity;
  status: AlertStatus;
  sensor: string;
  sensorAlias?: string;
  type: 'threshold' | 'anomaly' | 'connection' | 'system';
  message: string;
  value?: number;
  threshold?: {
    min?: number;
    max?: number;
  };
  acknowledgedAt?: number;
  acknowledgedBy?: string;
  resolvedAt?: number;
  soundPlayed?: boolean;
}

export interface AlertRule {
  id: string;
  name: string;
  enabled: boolean;
  sensor: string;
  condition: AlertCondition;
  severity: AlertSeverity;
  actions: AlertAction[];
  cooldown?: number; // Минимальный интервал между алертами (ms)
  lastTriggered?: number;
}

export interface AlertCondition {
  type: 'threshold' | 'rate_of_change' | 'duration' | 'pattern';
  operator?: '>' | '<' | '==' | '!=' | 'between' | 'outside';
  value?: number;
  value2?: number; // Для between/outside
  duration?: number; // Как долго условие должно быть true (ms)
  rateThreshold?: number; // Для rate_of_change
}

export interface AlertAction {
  type: 'sound' | 'desktop_notification' | 'log' | 'snapshot' | 'stop_recording';
  config?: {
    soundFile?: string;
    volume?: number;
    notificationTitle?: string;
    notificationBody?: string;
    logPath?: string;
  };
}

export interface AlertStatistics {
  total: number;
  active: number;
  acknowledged: number;
  resolved: number;
  bySeverity: Record<AlertSeverity, number>;
  bySensor: Record<string, number>;
  lastAlert?: Alert;
}
