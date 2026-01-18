import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { SettingsTabs } from '../widgets/SettingsTabs/SettingsTabs';
import { SerialPortWidget } from '../widgets/SerialPortWidget/SerialPortWidget';
import { LanguageSelector } from '../features/settings/LanguageSelector';
import { ThemeSelector } from '../features/settings/ThemeSelector';
import { ResetToFactoryCard } from '../features/reset/ResetToFactory';
import { Divider } from '@heroui/react';
import { SensorConfigWidget } from '../widgets/sensor-config/ui/SensorConfigWidget';
import { DatabaseManagementWidget } from '../widgets/DatabaseManagement/ui/DatabaseManagementWidget';
import { SensorCalibrationWidget } from '../widgets/SensorCalibration/ui/SensorCalibrationWidget';
import { LightManagement } from '../widgets';

type SettingsProps = {
  onReset: () => void;
};

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

const SettingsDashboard = ({ onReset }: SettingsProps) => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState('main');

  return (
    <div className="flex h-full w-full">
      {/* Sidebar с вкладками - фиксированная ширина */}
      <div className="w-64 border-r border-default-200 bg-background/60 backdrop-blur-xl">
        <div className="p-6 sticky top-0">
          <SettingsTabs activeSection={activeSection} onSelect={setActiveSection} />
        </div>
      </div>

      {/* Основной контент - занимает оставшееся пространство */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <div className="p-8 max-w-[1600px]">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t('settings.title')}
              </h1>
              <p className="text-default-500 mt-2 text-lg">{t('settings.subtitle')}</p>
            </motion.div>

            <Divider className="mb-8" />

            {/* Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {activeSection === 'main' && (
                  <>
                    <section>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-1 h-8 bg-primary rounded-full"></div>
                        <h2 className="text-2xl font-bold">{t('settings.sections.connection')}</h2>
                      </div>
                      <SerialPortWidget />
                    </section>

                    <Divider className="my-8" />

                    <section>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-1 h-8 bg-secondary rounded-full"></div>
                        <h2 className="text-2xl font-bold">{t('settings.sections.interface')}</h2>
                      </div>
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <LanguageSelector />
                        <ThemeSelector />
                      </div>
                    </section>

                    <Divider className="my-8" />

                    <section>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-1 h-8 bg-danger rounded-full"></div>
                        <h2 className="text-2xl font-bold">{t('settings.sections.system')}</h2>
                      </div>
                      <div className="max-w-2xl">
                        <ResetToFactoryCard onReset={onReset} />
                      </div>
                    </section>
                  </>
                )}

                {activeSection === 'sensors' && (
                  <>
                    <section>
                      <SensorConfigWidget />
                    </section>
                    <Divider className="my-8" />
                    <section>
                      <SensorCalibrationWidget />
                    </section>
                  </>
                )}

                {activeSection === 'database' && (
                  <section>
                    <DatabaseManagementWidget />
                  </section>
                )}

                {activeSection === 'advanced' && (
                  <section>
                    <LightManagement />
                  </section>
                )}

                {activeSection === 'about' && (
                  <section className="flex items-center justify-center py-32">
                    <div className="text-center space-y-4">
                      <div className="text-6xl opacity-20">ℹ️</div>
                      <h3 className="text-2xl font-semibold text-default-400">
                        {t('settings.tabs.about')}
                      </h3>
                      <p className="text-default-500">Coming soon...</p>
                    </div>
                  </section>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsDashboard;
