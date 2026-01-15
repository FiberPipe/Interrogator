// src/widgets/SettingsTabs/SettingsTabs.tsx
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Settings, Gauge, Sliders, Info, Database } from 'lucide-react';

interface SettingsTabsProps {
  activeSection: string;
  onSelect: (section: string) => void;
}

const tabs = [
  { id: 'main', icon: Settings, label: 'settings.tabs.main' },
  { id: 'sensors', icon: Gauge, label: 'settings.tabs.sensors' },
  { id: 'advanced', icon: Sliders, label: 'settings.tabs.advanced' },
  { id: 'about', icon: Info, label: 'settings.tabs.about' },
  { id: 'database', icon: Database, label: 'settings.tabs.database' },
];

export const SettingsTabs = ({ activeSection, onSelect }: SettingsTabsProps) => {
  const { t } = useTranslation();

  return (
    <nav className="space-y-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeSection === tab.id;

        return (
          <motion.button
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            className={`
              w-full flex items-center gap-3 px-4 py-3.5 rounded-xl
              transition-all duration-200 relative overflow-hidden
              ${isActive
                ? 'text-primary font-semibold shadow-lg'
                : 'text-default-600 hover:text-default-900 hover:bg-default-100'
              }
            `}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-primary-50 dark:bg-primary-900/20 rounded-xl"
                transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
              />
            )}

            {/* Индикатор слева */}
            {isActive && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full"
                transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
              />
            )}

            <div className={`
              relative z-10 p-2 rounded-lg transition-colors
              ${isActive ? 'bg-primary-100 dark:bg-primary-900/40' : 'bg-transparent'}
            `}>
              <Icon className="w-5 h-5" />
            </div>

            <span className="relative z-10 text-sm">
              {t(tab.label)}
            </span>

            {isActive && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-auto relative z-10"
              >
                <div className="w-2 h-2 bg-primary rounded-full" />
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </nav>
  );
};
