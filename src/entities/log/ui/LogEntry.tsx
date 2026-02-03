// src/entities/log/ui/LogEntry/LogEntry.tsx

import { Card, CardBody, Accordion, AccordionItem, Code, Chip } from '@heroui/react';
import { motion } from 'framer-motion';
import { useState, useMemo, memo } from 'react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

import type { LogEntry as LogEntryType } from '../../../shared/types/logs.types';
import { LogLevelBadge } from './LogLevelBadge';

interface LogEntryProps {
  log: LogEntryType;
  index: number;
}

// Мемоизированный компонент метаданных
const MetadataDisplay = memo(({ metadata }: { metadata: unknown }) => {
  const { t } = useTranslation();
  
  return (
    <div>
      <p className="text-xs font-semibold text-default-600 mb-1">
        📋 {t('logs.list.context')}:
      </p>
      <Code
        className="w-full text-xs"
        color="default"
        style={{
          maxHeight: '300px',
          overflow: 'auto',
        }}
      >
        <pre className="text-xs">
          {typeof metadata === 'string'
            ? metadata
            : JSON.stringify(metadata, null, 2)}
        </pre>
      </Code>
    </div>
  );
});

MetadataDisplay.displayName = 'MetadataDisplay';

// Мемоизированный компонент стека
const StackTraceDisplay = memo(({ stack }: { stack: string }) => {
  const { t } = useTranslation();
  
  return (
    <div>
      <p className="text-xs font-semibold text-danger mb-1">
        📚 {t('logs.list.stackTrace')}:
      </p>
      <Code
        className="w-full text-xs"
        color="danger"
        style={{
          maxHeight: '200px',
          overflow: 'auto',
        }}
      >
        <pre className="text-xs whitespace-pre-wrap">{stack}</pre>
      </Code>
    </div>
  );
});

StackTraceDisplay.displayName = 'StackTraceDisplay';

export const LogEntry = memo(({ log, index }: LogEntryProps) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  // Мемоизация парсинга метаданных
  const metadataData = useMemo(() => {
    if (!log.metadata) return null;
    try {
      return JSON.parse(log.metadata);
    } catch (e) {
      return log.metadata;
    }
  }, [log.metadata]);

  const hasDetails = metadataData || log.stack;

  // Мемоизация форматирования времени
  const formattedTime = useMemo(
    () => format(new Date(log.timestamp), 'HH:mm:ss.SSS'),
    [log.timestamp]
  );

  const formattedCreatedAt = useMemo(
    () => log.created_at ? format(new Date(log.created_at), 'dd.MM.yyyy HH:mm:ss') : null,
    [log.created_at]
  );

  // Упрощенная анимация только для первых элементов
  const shouldAnimate = index < 20;

  const cardContent = (
    <Card
      className={`mb-2 hover:shadow-md transition-shadow ${
        log.level === 'ERROR'
          ? 'border-l-4 border-danger'
          : log.level === 'WARN'
            ? 'border-l-4 border-warning'
            : ''
      }`}
    >
      <CardBody className="p-3">
        <div className="flex items-start gap-3">
          {/* Level Badge */}
          <div className="shrink-0">
            <LogLevelBadge level={log.level} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className="text-sm font-mono text-foreground break-words flex-1">
                {log.message}
              </p>
              <div className="flex items-center gap-2 shrink-0">
                {hasDetails && (
                  <Chip size="sm" variant="light" color="default">
                    {isExpanded ? '📂' : '📁'} {t('logs.list.metadata')}
                  </Chip>
                )}
                <span className="text-xs text-default-500 whitespace-nowrap">
                  {formattedTime}
                </span>
              </div>
            </div>

            {/* Area Badge */}
            {log.area && (
              <Chip size="sm" variant="flat" color="default" className="mb-2">
                {log.area}
              </Chip>
            )}

            {/* Metadata Accordion */}
            {hasDetails && (
              <Accordion
                variant="light"
                className="px-0"
                onSelectionChange={(keys) => {
                  setIsExpanded(Array.from(keys).length > 0);
                }}
              >
                <AccordionItem
                  key="metadata"
                  title={
                    <span className="text-xs text-default-500">
                      {isExpanded
                        ? `🔽 ${t('logs.list.hideDetails')}`
                        : `▶️ ${t('logs.list.showDetails')}`}
                    </span>
                  }
                  className="py-0"
                >
                  <div className="space-y-3 pt-2">
                    {/* Metadata */}
                    {metadataData && <MetadataDisplay metadata={metadataData} />}

                    {/* Stack Trace */}
                    {log.stack && <StackTraceDisplay stack={log.stack} />}

                    {/* Additional Info */}
                    <div className="flex gap-4 text-xs text-default-500">
                      <div>
                        <span className="font-semibold">{t('logs.list.id')}:</span>{' '}
                        {log.id || 'N/A'}
                      </div>
                      {formattedCreatedAt && (
                        <div>
                          <span className="font-semibold">{t('logs.list.createdAt')}:</span>{' '}
                          {formattedCreatedAt}
                        </div>
                      )}
                    </div>
                  </div>
                </AccordionItem>
              </Accordion>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );

  if (shouldAnimate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.01, duration: 0.2 }}
      >
        {cardContent}
      </motion.div>
    );
  }

  return cardContent;
});

LogEntry.displayName = 'LogEntry';
