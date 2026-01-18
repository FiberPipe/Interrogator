import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { Trash2, Download, Settings2 } from 'lucide-react';

interface ChartControlsProps {
  onClear: () => void;
  onExport?: () => void;
  onSettings?: () => void;
}

export const ChartControls = ({ onClear, onExport, onSettings }: ChartControlsProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="flat"
        color="warning"
        startContent={<Trash2 className="w-4 h-4" />}
        onPress={onClear}
      >
        {t('charts.controls.clear')}
      </Button>

      <Dropdown>
        <DropdownTrigger>
          <Button size="sm" variant="flat" isIconOnly>
            <Settings2 className="w-4 h-4" />
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="Chart actions">
          <DropdownItem
            key="export"
            startContent={<Download className="w-4 h-4" />}
            onPress={onExport}
          >
            {t('charts.controls.export')}
          </DropdownItem>
          <DropdownItem
            key="settings"
            startContent={<Settings2 className="w-4 h-4" />}
            onPress={onSettings}
          >
            {t('charts.controls.settings')}
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};
