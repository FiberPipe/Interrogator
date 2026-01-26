// src/pages/logs/ui/LogsPage.tsx

import { useEffect, useState, useCallback } from 'react';
import { Card, CardHeader, Button, Spinner } from '@heroui/react';
import { FileText, RefreshCw } from 'lucide-react';
import { LogsFilter, LogEntry, LogsStats } from '../electron/types';
import { LogsExport } from '../features/logs/ui/LogsExport';
import { logsApi } from '../shared/api/logs.api';
import { addDangerToaster, addSuccessToaster } from '../shared/ui';
import { LogsList } from '../widgets/logs';

import { LogsFilter as LogsFilterComponent } from '../features/logs/ui/LogsFilter';
import { LogsStats as LogsStatsComponent } from '../features/logs/ui/LogsStats';


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
            addDangerToaster('Failed to load logs: ' + message);
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
        <div className="flex flex-col h-full w-full overflow-hidden">
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
                <div className="container mx-auto p-6 space-y-6 pb-8">
                    {/* Header */}
                    <Card>
                        <CardHeader className="flex flex-row justify-between items-center p-6 gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                                    <FileText className="text-primary" size={24} />
                                </div>
                                <div className="min-w-0">
                                    <h1 className="text-2xl font-bold truncate">Application Logs</h1>
                                    <p className="text-sm text-default-500 truncate">
                                        Monitor and analyze application events (retention: 3 days)
                                    </p>
                                </div>
                            </div>
                            <div className="shrink-0">
                                <LogsExport
                                    filter={filter}
                                    onCleanup={handleCleanup}
                                    onClear={handleClear}
                                    onRefresh={handleRefresh}
                                />
                            </div>
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
                    <div className="flex justify-between items-center sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-2 -mx-2 px-2">
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
            </div>
        </div>
    );
};
