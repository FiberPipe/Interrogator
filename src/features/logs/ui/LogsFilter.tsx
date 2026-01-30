// src/features/logs/filter/ui/LogsFilter.tsx

import { Card, CardBody, Select, SelectItem, Input, Button, Chip } from '@heroui/react';
import { Search, X, Calendar, Filter } from 'lucide-react';
import { useState } from 'react';

import type { LogLevel, LogsFilter as ILogsFilter } from '../../../electron/logger/types';

interface LogsFilterProps {
  filter: ILogsFilter;
  onFilterChange: (filter: ILogsFilter) => void;
  onReset: () => void;
}

const LOG_LEVELS: LogLevel[] = ['DEBUG', 'INFO', 'WARN', 'ERROR'];

const TIME_PRESETS = [
  { label: 'Last 15 minutes', value: 15 * 60 * 1000 },
  { label: 'Last hour', value: 60 * 60 * 1000 },
  { label: 'Last 6 hours', value: 6 * 60 * 60 * 1000 },
  { label: 'Last 24 hours', value: 24 * 60 * 60 * 1000 },
  { label: 'Last 3 days', value: 3 * 24 * 60 * 60 * 1000 },
];

export const LogsFilter = ({ filter, onFilterChange, onReset }: LogsFilterProps) => {
  const [searchValue, setSearchValue] = useState(filter.search || '');

  const handleLevelChange = (keys: any) => {
    const level = Array.from(keys)[0] as LogLevel | undefined;
    onFilterChange({ ...filter, level });
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleSearchSubmit = () => {
    onFilterChange({ ...filter, search: searchValue || undefined });
  };

  const handleTimePreset = (milliseconds: number) => {
    const now = Date.now();
    const startTime = now - milliseconds;
    onFilterChange({ ...filter, startTime, endTime: now });
  };

  const handleClearTimeRange = () => {
    onFilterChange({ ...filter, startTime: undefined, endTime: undefined });
  };

  const activeFiltersCount = [filter.level, filter.search, filter.startTime, filter.endTime].filter(
    Boolean,
  ).length;

  return (
    <Card className="mb-4">
      <CardBody className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-default-500" />
              <h3 className="text-lg font-semibold">Filters</h3>
              {activeFiltersCount > 0 && (
                <Chip size="sm" color="primary" variant="flat">
                  {activeFiltersCount} active
                </Chip>
              )}
            </div>
            <Button size="sm" variant="light" color="default" onClick={onReset}>
              <X size={16} />
              Reset all
            </Button>
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Level Filter */}
            <Select
              label="Log Level"
              placeholder="All levels"
              selectedKeys={filter.level ? [filter.level] : []}
              onSelectionChange={handleLevelChange}
              size="sm"
              variant="bordered"
            >
              {LOG_LEVELS.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </Select>

            {/* Search */}
            <Input
              label="Search in messages"
              placeholder="Type to search..."
              value={searchValue}
              onValueChange={handleSearchChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearchSubmit();
              }}
              size="sm"
              variant="bordered"
              startContent={<Search size={16} className="text-default-400" />}
              endContent={
                searchValue && (
                  <button
                    onClick={() => {
                      setSearchValue('');
                      onFilterChange({ ...filter, search: undefined });
                    }}
                    className="text-default-400 hover:text-default-600"
                  >
                    <X size={16} />
                  </button>
                )
              }
            />

            {/* Limit */}
            <Select
              label="Results limit"
              placeholder="Select limit"
              selectedKeys={filter.limit ? [String(filter.limit)] : ['1000']}
              onSelectionChange={(keys) => {
                const limit = Number(Array.from(keys)[0]);
                onFilterChange({ ...filter, limit });
              }}
              size="sm"
              variant="bordered"
            >
              <SelectItem key="100" value="100">
                100 logs
              </SelectItem>
              <SelectItem key="500" value="500">
                500 logs
              </SelectItem>
              <SelectItem key="1000" value="1000">
                1000 logs
              </SelectItem>
              <SelectItem key="5000" value="5000">
                5000 logs
              </SelectItem>
            </Select>
          </div>

          {/* Time Range */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-default-500" />
              <span className="text-sm font-medium">Time Range</span>
              {(filter.startTime || filter.endTime) && (
                <Button size="sm" variant="light" color="default" onClick={handleClearTimeRange}>
                  Clear
                </Button>
              )}
            </div>

            {/* Time Presets */}
            <div className="flex flex-wrap gap-2">
              {TIME_PRESETS.map((preset) => (
                <Chip
                  key={preset.label}
                  className="cursor-pointer"
                  variant="flat"
                  color="default"
                  onClick={() => handleTimePreset(preset.value)}
                >
                  {preset.label}
                </Chip>
              ))}
            </div>

            {/* Active Time Range Display */}
            {(filter.startTime || filter.endTime) && (
              <div className="text-xs text-default-500 mt-2">
                {filter.startTime && (
                  <span>From: {new Date(filter.startTime).toLocaleString()}</span>
                )}
                {filter.startTime && filter.endTime && <span className="mx-2">→</span>}
                {filter.endTime && <span>To: {new Date(filter.endTime).toLocaleString()}</span>}
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
