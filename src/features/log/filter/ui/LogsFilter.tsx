// src/features/logs/filter/ui/LogsFilterCompact.tsx

import {
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Select,
  SelectItem,
  Input,
  Chip,
  Divider,
} from '@heroui/react';
import { Filter, X, Search, Calendar } from 'lucide-react';
import { useState, useCallback, useMemo, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebouncedCallback } from 'use-debounce';

import type { LogLevel, LogArea, LogsFilter } from '@/entities/log';

interface LogsFilterCompactProps {
  filter: LogsFilter;
  onFilterChange: (filter: LogsFilter) => void;
  onReset: () => void;
}

const LOG_LEVELS: LogLevel[] = ['DEBUG', 'INFO', 'WARN', 'ERROR'];

const LOG_AREAS: LogArea[] = [
  'App',
  'Database',
  'Serial',
  'Updater',
  'Logger',
  'IPC',
  'UI',
  'Storage',
  'Settings',
];

interface TimePreset {
  label: string;
  value: number;
}

// Мемоизированный компонент пресета времени
const TimePresetButton = memo(({
  preset,
  onClick
}: {
  preset: TimePreset;
  onClick: (value: number) => void;
}) => (
  <Button
    size="sm"
    variant="flat"
    onClick={() => onClick(preset.value)}
  >
    {preset.label}
  </Button>
));

TimePresetButton.displayName = 'TimePresetButton';

export const LogsFilterCompact = memo(({
  filter,
  onFilterChange,
  onReset,
}: LogsFilterCompactProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(filter.search || '');

  const TIME_PRESETS: TimePreset[] = useMemo(() => [
    { label: t('logs.filter.timePresets.15m'), value: 15 * 60 * 1000 },
    { label: t('logs.filter.timePresets.1h'), value: 60 * 60 * 1000 },
    { label: t('logs.filter.timePresets.6h'), value: 6 * 60 * 60 * 1000 },
    { label: t('logs.filter.timePresets.24h'), value: 24 * 60 * 60 * 1000 },
    { label: t('logs.filter.timePresets.3d'), value: 3 * 24 * 60 * 60 * 1000 },
  ], [t]);

  const activeFiltersCount = useMemo(() =>
    [
      filter.level,
      filter.area,
      filter.search,
      filter.startTime,
      filter.endTime,
    ].filter(Boolean).length,
    [filter]
  );

  // Debounced search
  const debouncedSearch = useDebouncedCallback((value: string) => {
    onFilterChange({ ...filter, search: value || undefined });
  }, 500);

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  const handleLevelChange = useCallback((keys: 'all' | Set<React.Key>) => {
    if (keys === 'all') return;
    const level = Array.from(keys)[0] as LogLevel | undefined;
    onFilterChange({ ...filter, level });
  }, [filter, onFilterChange]);

  const handleAreaChange = useCallback((keys: 'all' | Set<React.Key>) => {
    if (keys === 'all') return;
    const area = Array.from(keys)[0] as LogArea | undefined;
    onFilterChange({ ...filter, area });
  }, [filter, onFilterChange]);

  const handleTimePreset = useCallback((milliseconds: number) => {
    const now = Date.now();
    const startTime = now - milliseconds;
    onFilterChange({ ...filter, startTime, endTime: now });
  }, [filter, onFilterChange]);

  const handleClearTimeRange = useCallback(() => {
    onFilterChange({ ...filter, startTime: undefined, endTime: undefined });
  }, [filter, onFilterChange]);

  const handleResetAll = useCallback(() => {
    setSearchValue('');
    onReset();
    setIsOpen(false);
  }, [onReset]);

  const handleClearSearch = useCallback(() => {
    setSearchValue('');
    onFilterChange({ ...filter, search: undefined });
  }, [filter, onFilterChange]);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Quick Search */}
      <Input
        placeholder={t('logs.filter.search')}
        value={searchValue}
        onValueChange={handleSearchChange}
        size="sm"
        className="max-w-xs"
        isClearable
        onClear={handleClearSearch}
        startContent={<Search size={16} className="text-default-400" />}
      />

      {/* Advanced Filters Popover */}
      <Popover placement="bottom-start" isOpen={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger>
          <Button
            size="sm"
            variant="flat"
            startContent={<Filter size={16} />}
            endContent={
              activeFiltersCount > 0 && (
                <Chip size="sm" color="primary" variant="solid" className="h-5 min-w-5 px-1">
                  {activeFiltersCount}
                </Chip>
              )
            }
          >
            {t('logs.filter.title')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-4">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">{t('logs.filter.advancedFilters')}</h4>
              {activeFiltersCount > 0 && (
                <Button size="sm" variant="light" onClick={handleResetAll}>
                  {t('logs.filter.resetAll')}
                </Button>
              )}
            </div>

            <Divider />

            {/* Level */}
            <Select
              label={t('logs.filter.level')}
              placeholder={t('logs.filter.allLevels')}
              selectedKeys={filter.level ? new Set([filter.level]) : new Set()}
              onSelectionChange={handleLevelChange}
              size="sm"
              variant="bordered"
            >
              {LOG_LEVELS.map((level) => (
                <SelectItem key={level} value={level}>
                  {t(`logs.levels.${level}`)}
                </SelectItem>
              ))}
            </Select>

            {/* Area */}
            <Select
              label={t('logs.filter.area')}
              placeholder={t('logs.filter.allAreas')}
              selectedKeys={filter.area ? new Set([filter.area]) : new Set()}
              onSelectionChange={handleAreaChange}
              size="sm"
              variant="bordered"
            >
              {LOG_AREAS.map((area) => (
                <SelectItem key={area} value={area}>
                  {area}
                </SelectItem>
              ))}
            </Select>

            {/* Limit */}
            <Select
              label={t('logs.filter.limit')}
              selectedKeys={filter.limit ? new Set([String(filter.limit)]) : new Set(['1000'])}
              onSelectionChange={(keys) => {
                if (keys === 'all') return;
                const limit = Number(Array.from(keys)[0]);
                onFilterChange({ ...filter, limit });
              }}
              size="sm"
              variant="bordered"
            >
              <SelectItem key="100">100</SelectItem>
              <SelectItem key="500">500</SelectItem>
              <SelectItem key="1000">1000</SelectItem>
              <SelectItem key="5000">5000</SelectItem>
            </Select>

            <Divider />

            {/* Time Range */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Calendar size={14} />
                  {t('logs.filter.timeRange')}
                </label>
                {(filter.startTime || filter.endTime) && (
                  <Button size="sm" variant="light" onClick={handleClearTimeRange}>
                    {t('logs.filter.clear')}
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {TIME_PRESETS.map((preset) => (
                  <TimePresetButton
                    key={preset.label}
                    preset={preset}
                    onClick={handleTimePreset}
                  />
                ))}
              </div>

              {(filter.startTime || filter.endTime) && (
                <div className="text-xs text-default-500 bg-default-100 p-2 rounded space-y-1">
                  {filter.startTime && (
                    <div>
                      {t('logs.filter.from')}: {new Date(filter.startTime).toLocaleString()}
                    </div>
                  )}
                  {filter.endTime && (
                    <div>
                      {t('logs.filter.to')}: {new Date(filter.endTime).toLocaleString()}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filter Chips */}
      {filter.level && (
        <Chip
          size="sm"
          variant="flat"
          onClose={() => onFilterChange({ ...filter, level: undefined })}
        >
          {t('logs.filter.level')}: {t(`logs.levels.${filter.level}`)}
        </Chip>
      )}
      {filter.area && (
        <Chip
          size="sm"
          variant="flat"
          onClose={() => onFilterChange({ ...filter, area: undefined })}
        >
          {t('logs.filter.area')}: {filter.area}
        </Chip>
      )}
      {(filter.startTime || filter.endTime) && (
        <Chip size="sm" variant="flat" onClose={handleClearTimeRange}>
          <Calendar size={12} className="mr-1" />
          {t('logs.filter.customRange')}
        </Chip>
      )}
    </div>
  );
});

LogsFilterCompact.displayName = 'LogsFilterCompact';
