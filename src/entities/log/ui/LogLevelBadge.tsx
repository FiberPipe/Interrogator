// src/entities/log/ui/LogLevelBadge/LogLevelBadge.tsx

import { Chip } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { LogLevel } from '../../../shared/types/logs.types';


interface LogLevelBadgeProps {
  level: LogLevel;
  size?: 'sm' | 'md' | 'lg';
}

const levelConfig = {
  DEBUG: {
    color: 'default' as const,
    icon: '🐛',
  },
  INFO: {
    color: 'primary' as const,
    icon: 'ℹ️',
  },
  WARN: {
    color: 'warning' as const,
    icon: '⚠️',
  },
  ERROR: {
    color: 'danger' as const,
    icon: '🔥',
  },
};

export const LogLevelBadge = ({ level, size = 'sm' }: LogLevelBadgeProps) => {
  const { t } = useTranslation();
  const config = levelConfig[level] || levelConfig.INFO;

  return (
    <Chip color={config.color} size={size} variant="flat">
      <span className="flex items-center gap-1">
        <span>{config.icon}</span>
        <span>{t(`logs.levels.${level}`)}</span>
      </span>
    </Chip>
  );
};
