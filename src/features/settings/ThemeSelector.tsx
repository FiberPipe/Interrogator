import { Card, CardBody, CardHeader, Button } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

import { patchAppData } from '../../app/hooks/useOnboarding';
import { addSuccessToaster } from '../../shared/ui';

const themes = [
  { value: 'light', icon: Sun, label: 'settings.theme.light' },
  { value: 'dark', icon: Moon, label: 'settings.theme.dark' },
  { value: 'system', icon: Monitor, label: 'settings.theme.system' },
];

export const ThemeSelector = () => {
  const { t } = useTranslation();
  const [currentTheme, setCurrentTheme] = useState<string>('system');

  useEffect(() => {
    // Загружаем текущую тему
    window.appData.getAll().then((data) => {
      if (data?.theme) {
        setCurrentTheme(data.theme as string);
      }
    });
  }, []);

  const handleThemeChange = async (theme: string) => {
    setCurrentTheme(theme);

    // Применяем тему
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    document.documentElement.classList.toggle('dark', isDark);

    // Сохраняем в БД
    await patchAppData({ theme });

    addSuccessToaster(
      t('settings.theme.changed'),
      t('settings.theme.changedDescription', { theme: t(`settings.theme.${theme}`) }),
    );
  };

  return (
    <Card>
      <CardHeader className="flex gap-3">
        <div className="p-2 rounded-lg bg-secondary-100 dark:bg-secondary-900/30">
          <Sun className="w-5 h-5 text-secondary" />
        </div>
        <div className="flex flex-col">
          <h4 className="text-lg font-semibold">{t('settings.theme.title')}</h4>
          <p className="text-sm text-default-500">{t('settings.theme.description')}</p>
        </div>
      </CardHeader>

      <CardBody>
        <div className="grid grid-cols-3 gap-3">
          {themes.map((theme) => {
            const Icon = theme.icon;
            const isActive = currentTheme === theme.value;

            return (
              <motion.div key={theme.value} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  fullWidth
                  variant={isActive ? 'solid' : 'bordered'}
                  color={isActive ? 'secondary' : 'default'}
                  onPress={() => handleThemeChange(theme.value)}
                  className="h-20 flex-col gap-2"
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-sm">{t(theme.label)}</span>
                  {isActive && <Check className="w-4 h-4 absolute top-2 right-2" />}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
};
