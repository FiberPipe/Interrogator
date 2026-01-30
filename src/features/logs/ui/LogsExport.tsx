// src/features/logs/export/ui/LogsExport.tsx

import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import { Download, FileJson, Trash2, RefreshCw } from 'lucide-react';
import { useState } from 'react';

import { addDangerToaster, addSuccessToaster } from '../../../shared/ui';
import { logsApi } from '../../../shared/api/logs.api';
import type { LogsFilter } from '../../../shared/types/logs';

interface LogsExportProps {
  filter: LogsFilter;
  onCleanup: () => void;
  onClear: () => void;
  onRefresh: () => void;
}

export const LogsExport = ({ filter, onCleanup, onClear, onRefresh }: LogsExportProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await logsApi.export({
        level: filter.level,
        startTime: filter.startTime,
        endTime: filter.endTime,
      });

      if (result.cancelled) {
        addSuccessToaster('Export cancelled');
      } else if (result.success) {
        addSuccessToaster(`Logs exported to: ${result.path}`);
      } else {
        addDangerToaster('Failed to export logs');
      }
    } catch (err) {
      addDangerToaster('Export error: ' + String(err));
    } finally {
      setIsExporting(false);
    }
  };

  const handleCleanup = async () => {
    try {
      const result = await logsApi.cleanup();
      if (result.success) {
        addSuccessToaster(`Cleaned up ${result.deletedCount} old logs`);
        onCleanup();
      }
    } catch (err) {
      addDangerToaster('Cleanup error: ' + String(err));
    }
  };

  const handleClear = async () => {
    if (!confirm('Are you sure you want to delete ALL logs? This action cannot be undone.')) {
      return;
    }

    setIsClearing(true);
    try {
      const result = await logsApi.clear();
      if (result.success) {
        addSuccessToaster('All logs cleared');
        onClear();
      }
    } catch (err) {
      addDangerToaster('Clear error: ' + String(err));
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Refresh */}
      <Button size="sm" variant="flat" color="default" onClick={onRefresh} isIconOnly>
        <RefreshCw size={16} />
      </Button>

      {/* Export */}
      <Button
        size="sm"
        color="primary"
        variant="flat"
        onClick={handleExport}
        isLoading={isExporting}
        startContent={!isExporting && <Download size={16} />}
      >
        Export
      </Button>

      {/* Actions Menu */}
      <Dropdown>
        <DropdownTrigger>
          <Button size="sm" variant="flat" color="default">
            Actions
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="Log actions">
          <DropdownItem
            key="cleanup"
            startContent={<RefreshCw size={16} />}
            onClick={handleCleanup}
          >
            Cleanup old logs (3+ days)
          </DropdownItem>
          <DropdownItem
            key="clear"
            startContent={<Trash2 size={16} />}
            className="text-danger"
            color="danger"
            onClick={handleClear}
            isDisabled={isClearing}
          >
            Clear all logs
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};
