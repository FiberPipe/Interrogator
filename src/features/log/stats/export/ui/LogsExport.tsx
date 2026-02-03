// src/features/logs/export/ui/LogsExport.tsx

import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import { Download, Trash2, RefreshCw, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { logsApi } from '../../../../../shared/api/logger.api';
import { LogsFilter } from '../../../../../shared/types/logs.types';


interface LogsExportProps {
  filter: LogsFilter;
  onCleanup: () => void;
  onClear: () => void;
  onRefresh: () => void;
}

export const LogsExport = ({ filter, onCleanup, onClear, onRefresh }: LogsExportProps) => {
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const showSuccessToast = (message: string) => {
    // Используйте вашу систему уведомлений
    console.log('[SUCCESS]', message);
  };

  const showErrorToast = (message: string) => {
    // Используйте вашу систему уведомлений
    console.error('[ERROR]', message);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await logsApi.export({
        level: filter.level,
        area: filter.area,
        startTime: filter.startTime,
        endTime: filter.endTime,
      });

      if (result.cancelled) {
        showSuccessToast(t('logs.export.cancelled'));
      } else if (result.success && result.path) {
        showSuccessToast(t('logs.export.success', { path: result.path }));
      } else {
        showErrorToast(t('logs.export.error'));
      }
    } catch (err) {
      showErrorToast(t('logs.export.error') + ': ' + String(err));
    } finally {
      setIsExporting(false);
    }
  };

  const handleCleanup = async () => {
    try {
      const result = await logsApi.cleanup();
      if (result.success) {
        showSuccessToast(
          t('logs.export.cleanupSuccess', { count: result.deletedCount })
        );
        onCleanup();
      }
    } catch (err) {
      showErrorToast(String(err));
    }
  };

  const handleClear = async () => {
    if (!confirm(t('logs.export.clearConfirm'))) {
      return;
    }

    setIsClearing(true);
    try {
      const result = await logsApi.clear();
      if (result.success) {
        showSuccessToast(t('logs.export.clearSuccess'));
        onClear();
      }
    } catch (err) {
      showErrorToast(String(err));
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Refresh */}
      <Button
        size="sm"
        variant="flat"
        color="default"
        onClick={onRefresh}
        isIconOnly
        aria-label={t('logs.export.refresh')}
      >
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
        {t('logs.export.title')}
      </Button>

      {/* Actions Menu */}
      <Dropdown>
        <DropdownTrigger>
          <Button size="sm" variant="flat" color="default" isIconOnly>
            <MoreVertical size={16} />
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label={t('logs.export.actions')}>
          <DropdownItem
            key="cleanup"
            startContent={<RefreshCw size={16} />}
            onClick={handleCleanup}
          >
            {t('logs.export.cleanup')}
          </DropdownItem>
          <DropdownItem
            key="clear"
            startContent={<Trash2 size={16} />}
            className="text-danger"
            color="danger"
            onClick={handleClear}
            isDisabled={isClearing}
          >
            {t('logs.export.clear')}
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};
