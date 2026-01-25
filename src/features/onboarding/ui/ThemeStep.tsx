import { Button, Card } from '@heroui/react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Moon, Sun, Monitor } from 'lucide-react';

import { patchAppData } from '../../../app/hooks/useOnboarding';

const themes = [
  { value: 'light', icon: Sun, label: 'onboarding.theme.light' },
  { value: 'dark', icon: Moon, label: 'onboarding.theme.dark' },
  { value: 'system', icon: Monitor, label: 'onboarding.theme.system' },
];

export default function ThemeStep({ onNext, onBack }: any) {
  const { t } = useTranslation();

  const handleThemeSelect = async (theme: string) => {
    // Применяем тему сразу
    document.documentElement.classList.toggle(
      'dark',
      theme === 'dark' ||
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches),
    );

    // Сохраняем в БД и переходим дальше
    await patchAppData({ theme });
    onNext({ theme });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">{t('onboarding.theme.title')}</h2>
        <p className="text-sm text-default-500">{t('onboarding.theme.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
        {themes.map((theme, index) => {
          const Icon = theme.icon;
          return (
            <motion.div
              key={theme.value}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full"
            >
              <Card
                isPressable
                onPress={() => handleThemeSelect(theme.value)}
                className="p-6 w-full h-full cursor-pointer border-2 border-transparent hover:border-primary transition-all"
              >
                <div className="flex flex-col items-center justify-center gap-3 h-full">
                  <div className="p-4 rounded-full bg-primary-100 dark:bg-primary-900/30">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <span className="font-semibold">{t(theme.label)}</span>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
