import { Button, Card } from '@heroui/react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { patchAppData } from '../../app/hooks/useOnboarding';

const languages = [
  { code: 'ru', label: 'onboarding.language.ru', flag: '🇷🇺' },
  { code: 'en', label: 'onboarding.language.en', flag: '🇬🇧' },
];

export default function LanguageStep({ onNext }: { onNext: (d: any) => void }) {
  const { t, i18n } = useTranslation();

  const handleLanguageSelect = async (lang: string) => {
    // Сразу меняем язык
    await i18n.changeLanguage(lang);
    // Сохраняем в БД и переходим дальше
    await patchAppData({ language: lang });
    onNext({ language: lang });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">{t('onboarding.language.title')}</h2>
        <p className="text-sm text-default-500">{t('onboarding.language.subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {languages.map((lang, index) => (
          <motion.div
            key={lang.code}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Card
              isPressable
              onPress={() => handleLanguageSelect(lang.code)}
              className={`p-6 cursor-pointer border-2 transition-all ${i18n.language === lang.code
                  ? 'border-primary bg-primary-50 dark:bg-primary-900/20'
                  : 'border-transparent hover:border-default-300'
                }`}
            >
              <div className="flex flex-col items-center gap-3">
                <span className="text-5xl">{lang.flag}</span>
                <span className="font-semibold text-lg">{t(lang.label)}</span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
