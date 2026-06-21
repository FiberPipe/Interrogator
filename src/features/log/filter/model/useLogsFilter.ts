// src/features/logs/filter/model/useLogsFilter.ts

import { useState, useCallback } from 'react';
import { LogsFilter } from '../../../../shared/types/logs.types';

const DEFAULT_FILTER: LogsFilter = {
  limit: 1000,
};

export const useLogsFilter = () => {
  const [filter, setFilter] = useState<LogsFilter>(DEFAULT_FILTER);

  const updateFilter = useCallback((newFilter: Partial<LogsFilter>) => {
    setFilter((prev) => ({ ...prev, ...newFilter }));
  }, []);

  const resetFilter = useCallback(() => {
    setFilter(DEFAULT_FILTER);
  }, []);

  const setFullFilter = useCallback((newFilter: LogsFilter) => {
    setFilter(newFilter);
  }, []);

  return {
    filter,
    updateFilter,
    resetFilter,
    setFilter: setFullFilter,
  };
};
