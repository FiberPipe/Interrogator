import { Card } from '@heroui/react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Settings, Gauge, Sliders, Info } from 'lucide-react';

interface SettingsTabsProps {
  activeSection: string;
  onSelect: (section: string) => void;
}

const tabs = [
  { id: 'main', icon: Settings, label: 'settings.tabs.main' },
  { id: 'sensors', icon: Gauge, label: 'settings.tabs.sensors' },
  { id: 'advanced', icon: Sliders, label: 'settings.tabs.advanced' },
  { id: 'about', icon: Info, label: 'settings.tabs.about' },
];

export const SettingsTabs = ({ activeSection, onSelect }: SettingsTabsProps) => {
  const { t } = useTranslation();

  return (
    <Card className="w-64 h-fit p-2">
      <div className="space-y-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;

          return (
            <motion.button
              key={tab.id}
              onClick={() => onSelect(tab.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg
                transition-colors relative overflow-hidden
                ${isActive
                  ? 'text-primary font-medium'
                  : 'text-default-600 hover:text-default-900 hover:bg-default-100'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary-50 dark:bg-primary-900/20"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon className="w-5 h-5 relative z-10" />
              <span className="relative z-10">{t(tab.label)}</span>
            </motion.button>
          );
        })}
      </div>
    </Card>
  );
};
