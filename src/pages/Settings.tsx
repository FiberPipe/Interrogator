import { useState } from 'react';
import { Card, Alert } from '@heroui/react';
import { ComPortSelector, LanguageSelector, ThemeSelector } from '../features';
import { SettingsTabs } from '../widgets';

const SettingsDashboard = () => {
  const [activeSection, setActiveSection] = useState('main');

  return (
    <div className="flex h-full gap-6 p-6 max-w-6xl">
      <SettingsTabs activeSection={activeSection} onSelect={setActiveSection} />

      <div className="flex-1 flex flex-col gap-6">
        {activeSection === 'main' && (
          <>
            <ComPortSelector />
            <LanguageSelector />
            <ThemeSelector />
          </>
        )}

        {activeSection === 'sensors' && (
          <Card className="p-6 flex flex-col gap-4">
            <h3 className="text-xl font-semibold">Настройка датчиков</h3>
            <p className="text-sm text-default-500">
              Здесь будут параметры для настройки количества датчиков и других параметров.
            </p>

            <Alert color="warning" title="Пока недоступно">
              Раздел будет доступен после добавления логики настройки датчиков.
            </Alert>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SettingsDashboard;
