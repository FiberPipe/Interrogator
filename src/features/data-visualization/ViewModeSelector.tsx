import { Button } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { LineChart, Table } from 'lucide-react';

import type { ViewMode } from '../../../entities/sensor-data/model/types';

interface ViewModeSelectorProps {
  activeMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

const modes: { type: ViewMode; icon: typeof LineChart }[] = [
  { type: 'chart', icon: LineChart },
  { type: 'table', icon: Table },
];

export const ViewModeSelector = ({ activeMode, onModeChange }: ViewModeSelectorProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex gap-1 p-1 bg-default-100 rounded-lg">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = activeMode === mode.type;

        return (
          <div key={mode.type} className="relative">
            {isActive && (
              <motion.div
                layoutId="activeViewMode"
                className="absolute inset-0 bg-background rounded-md shadow-sm"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <Button
              variant="light"
              size="sm"
              onPress={() => onModeChange(mode.type)}
              className={`relative z-10 ${isActive ? 'text-primary' : 'text-default-600'}`}
              startContent={<Icon className="w-4 h-4" />}
            >
              {t(`charts.types.${mode.type}`)}
            </Button>
          </div>
        );
      })}
    </div>
  );
};
