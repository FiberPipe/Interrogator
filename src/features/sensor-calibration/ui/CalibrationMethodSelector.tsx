import { Button } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Table, FileText, FileJson, Code } from 'lucide-react';
import type { CalibrationMethod } from '../model/types';

interface CalibrationMethodSelectorProps {
  activeMethod: CalibrationMethod;
  onMethodChange: (method: CalibrationMethod) => void;
}

const methods = [
  { type: 'table' as CalibrationMethod, icon: Table },
  { type: 'csv' as CalibrationMethod, icon: FileText },
  { type: 'json' as CalibrationMethod, icon: FileJson },
  { type: 'code' as CalibrationMethod, icon: Code },
];

export const CalibrationMethodSelector = ({
  activeMethod,
  onMethodChange,
}: CalibrationMethodSelectorProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex gap-1 p-1 bg-default-100 rounded-lg w-fit">
      {methods.map((method) => {
        const Icon = method.icon;
        const isActive = activeMethod === method.type;

        return (
          <div key={method.type} className="relative">
            {isActive && (
              <motion.div
                layoutId="activeCalibrationMethod"
                className="absolute inset-0 bg-background rounded-md shadow-sm"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <Button
              variant="light"
              size="sm"
              onPress={() => onMethodChange(method.type)}
              className={`relative z-10 ${isActive ? 'text-primary' : 'text-default-600'}`}
              startContent={<Icon className="w-4 h-4" />}
            >
              {t(`calibration.methods.${method.type}`)}
            </Button>
          </div>
        );
      })}
    </div>
  );
};
