// src/shared/ui/LogEntry/LogEntry.tsx

import { Card, CardBody, Accordion, AccordionItem, Code, Chip } from '@heroui/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { format } from 'date-fns';

import type { LogEntry as LogEntryType } from '../../types/logs.types';
import { LogLevelBadge } from '../log-level-badge';

interface LogEntryProps {
  log: LogEntryType;
  index: number;
}

export const LogEntry = ({ log, index }: LogEntryProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Парсим контекст если есть
  let contextData: any = null;
  try {
    if (log.context) {
      contextData = JSON.parse(log.context);
    }
  } catch (e) {
    contextData = log.context;
  }

  const hasMetadata = contextData || log.stack;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02, duration: 0.3 }}
    >
      <Card
        className={`mb-2 ${
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
            <LogLevelBadge level={log.level} />

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-sm font-mono text-foreground break-words">{log.message}</p>
                <div className="flex items-center gap-2 shrink-0">
                  {hasMetadata && (
                    <Chip size="sm" variant="light" color="default">
                      {isExpanded ? '📂 Opened' : '📁 Metadata'}
                    </Chip>
                  )}
                  <span className="text-xs text-default-500 whitespace-nowrap">
                    {format(new Date(log.timestamp), 'HH:mm:ss.SSS')}
                  </span>
                </div>
              </div>

              {/* Metadata Accordion */}
              {hasMetadata && (
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
                        {isExpanded ? '🔽 Hide details' : '▶️ Show details'}
                      </span>
                    }
                    className="py-0"
                  >
                    <div className="space-y-3 pt-2">
                      {/* Context */}
                      {contextData && (
                        <div>
                          <p className="text-xs font-semibold text-default-600 mb-1">📋 Context:</p>
                          <Code
                            className="w-full text-xs"
                            color="default"
                            style={{
                              maxHeight: '300px',
                              overflow: 'auto',
                            }}
                          >
                            <pre className="text-xs">
                              {typeof contextData === 'string'
                                ? contextData
                                : JSON.stringify(contextData, null, 2)}
                            </pre>
                          </Code>
                        </div>
                      )}

                      {/* Stack Trace */}
                      {log.stack && (
                        <div>
                          <p className="text-xs font-semibold text-danger mb-1">📚 Stack Trace:</p>
                          <Code
                            className="w-full text-xs"
                            color="danger"
                            style={{
                              maxHeight: '200px',
                              overflow: 'auto',
                            }}
                          >
                            <pre className="text-xs whitespace-pre-wrap">{log.stack}</pre>
                          </Code>
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="flex gap-4 text-xs text-default-500">
                        <div>
                          <span className="font-semibold">ID:</span> {log.id || 'N/A'}
                        </div>
                        <div>
                          <span className="font-semibold">Created:</span>{' '}
                          {log.created_at
                            ? format(new Date(log.created_at), 'dd.MM.yyyy HH:mm:ss')
                            : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </AccordionItem>
                </Accordion>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};
