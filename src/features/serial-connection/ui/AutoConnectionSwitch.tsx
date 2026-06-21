import { Switch } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

interface AutoConnectSwitchProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export const AutoConnectSwitch = ({ value, onChange }: AutoConnectSwitchProps) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-4 bg-default-100 dark:bg-default-50/5 rounded-lg"
    >
      <div className="flex flex-col">
        <span className="text-sm font-medium">{t('serialPort.autoConnect.title')}</span>
        <span className="text-xs text-default-500">{t('serialPort.autoConnect.description')}</span>
      </div>
      <Switch isSelected={value} onValueChange={onChange} color="success" size="sm" />
    </motion.div>
  );
};
