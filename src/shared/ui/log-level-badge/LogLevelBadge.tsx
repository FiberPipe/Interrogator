// src/shared/ui/LogLevelBadge/LogLevelBadge.tsx

import { Chip } from '@heroui/react';

import type { LogLevel } from '../../types/logs.types';

interface LogLevelBadgeProps {
  level: LogLevel;
  size?: 'sm' | 'md' | 'lg';
}

const levelConfig = {
  DEBUG: {
    color: 'default' as const,
    label: 'Debug',
    icon: '🐛',
  },
  INFO: {
    color: 'primary' as const,
    label: 'Info',
    icon: 'ℹ️',
  },
  WARN: {
    color: 'warning' as const,
    label: 'Warning',
    icon: '⚠️',
  },
  ERROR: {
    color: 'danger' as const,
    label: 'Error',
    icon: '🔥',
  },
};

export const LogLevelBadge = ({ level, size = 'sm' }: LogLevelBadgeProps) => {
  const config = levelConfig[level] || levelConfig.INFO;

  return (
    <Chip color={config.color} size={size} variant="flat">
      <span className="flex items-center gap-1">
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </span>
    </Chip>
  );
};
