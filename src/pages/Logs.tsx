// src/pages/logs/ui/LogsPage.tsx

import { useEffect, useState, useCallback } from 'react';
import { Card, CardHeader, Button, Spinner, toast } from '@heroui/react';
import { FileText, RefreshCw } from 'lucide-react';

import { LogsStats as LogsStatsComponent } from '../features/logs/ui/LogsStats';
import { LogsFilter as LogsFilterComponent } from '../features/logs/ui/LogsFilter';
import { addSuccessToaster } from '../shared/ui';
import { logsApi } from '../shared/api/logs.api';
import { LogEntry } from '../electron/logger/utils';
import { LogsExport } from '../features/logs/ui/LogsExport';
import { LogsFilter, LogsStats } from '../shared/types/logs';
import { LogsList } from '../widgets/logs';

const DEFAULT_FILTER: LogsFilter = {
    limit: 1000,
};

export const LogsPage = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [stats, setStats] = useState<LogsStats | null>(null);
    const [filter, setFilter] = useState<LogsFilter>(DEFAULT_FILTER);
    const [isLoading, setIsLoading] = useState(false);
    const [isStatsLoading, setIsStatsLoading] = useState(false);
    const [error, setError] = useState<string>();

    // Загрузка логов
    const loadLogs = useCallback(async () => {
        setIsLoading(true);
        setError(undefined);
        try {
            const data = await logsApi.getLogs(filter);
            setLogs(data);
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            setError(message);
            toast.error('Failed to load logs: ' + message);
        } finally {
            setIsLoading(false);
        }
    }, [filter]);

    // Загрузка статистики
    const loadStats = useCallback(async () => {
        setIsStatsLoading(true);
        try {
            const data = await logsApi.getStats();
            setStats(data);
        } catch (err) {
            console.error('Failed to load stats:', err);
        } finally {
            setIsStatsLoading(false);
        }
    }, []);

    // Начальная загрузка
    useEffect(() => {
        loadLogs();
        loadStats();
    }, [loadLogs, loadStats]);

    // Обработчики
    const handleFilterChange = (newFilter: LogsFilter) => {
        setFilter(newFilter);
    };

    const handleFilterReset = () => {
        setFilter(DEFAULT_FILTER);
    };

    const handleRefresh = () => {
        loadLogs();
        loadStats();
        addSuccessToaster('Logs refreshed');
    };

    const handleCleanup = () => {
        loadLogs();
        loadStats();
    };

    const handleClear = () => {
        setLogs([]);
        loadStats();
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <Card>
                <CardHeader className="flex justify-between items-center p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <FileText className="text-primary" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Application Logs</h1>
                            <p className="text-sm text-default-500">
                                Monitor and analyze application events (retention: 3 days)
                            </p>
                        </div>
                    </div>
                    <LogsExport
                        filter={filter}
                        onCleanup={handleCleanup}
                        onClear={handleClear}
                        onRefresh={handleRefresh}
                    />
                </CardHeader>
            </Card>

            {/* Statistics */}
            <LogsStatsComponent stats={stats} isLoading={isStatsLoading} />

            {/* Filters */}
            <LogsFilterComponent
                filter={filter}
                onFilterChange={handleFilterChange}
                onReset={handleFilterReset}
            />

            {/* Results Header */}
            <div className="flex justify-between items-center">
                <p className="text-sm text-default-500">
                    {isLoading ? (
                        <span className="flex items-center gap-2">
                            <Spinner size="sm" />
                            Loading...
                        </span>
                    ) : (
                        `Showing ${logs.length} log${logs.length !== 1 ? 's' : ''}`
                    )}
                </p>
                <Button size="sm" variant="light" onClick={loadLogs} isIconOnly>
                    <RefreshCw size={16} />
                </Button>
            </div>

            {/* Logs List */}
            <LogsList logs={logs} isLoading={isLoading} error={error} onRetry={loadLogs} />
        </div>
    );
};
