import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { SettingsTabs } from '../widgets/SettingsTabs/SettingsTabs';
import { SerialPortWidget } from '../widgets/SerialPortWidget/SerialPortWidget';
import { LanguageSelector } from '../features/settings/LanguageSelector';
import { ThemeSelector } from '../features/settings/ThemeSelector';
import { ResetToFactoryCard } from '../features/reset/ResetToFactory';
import { SensorsSection } from '../features/settings/SensorsSection';
import { Divider } from '@heroui/react';

type SettingsProps = {
  onReset: () => void;
};

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const SettingsDashboard = ({ onReset }: SettingsProps) => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState('main');

  return (
    <div className="flex h-full gap-6 p-6 max-w-7xl mx-auto">
      <SettingsTabs activeSection={activeSection} onSelect={setActiveSection} />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t('settings.title')}
          </h1>
          <p className="text-default-500 mt-1">{t('settings.subtitle')}</p>
        </motion.div>

        <Divider className="mb-6" />

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-6 flex-1 overflow-auto pr-2"
          >
            {activeSection === 'main' && (
              <>
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-primary rounded-full"></span>
                    {t('settings.sections.connection')}
                  </h3>
                  <SerialPortWidget />
                </div>

                <Divider />

                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-secondary rounded-full"></span>
                    {t('settings.sections.interface')}
                  </h3>
                  <div className="space-y-4">
                    <LanguageSelector />
                    <ThemeSelector />
                  </div>
                </div>

                <Divider />

                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-danger rounded-full"></span>
                    {t('settings.sections.system')}
                  </h3>
                  <ResetToFactoryCard onReset={onReset} />
                </div>
              </>
            )}

            {activeSection === 'sensors' && <SensorsSection />}

            {activeSection === 'advanced' && (
              <div className="text-center text-default-400 py-20">
                {t('settings.tabs.advanced')} - Coming soon...
              </div>
            )}

            {activeSection === 'about' && (
              <div className="text-center text-default-400 py-20">
                {t('settings.tabs.about')} - Coming soon...
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SettingsDashboard;
