import { Card, CardBody, CardHeader, Button } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Languages, Check } from 'lucide-react';
import { patchAppData } from '../../app/hooks/useOnboarding';
import { addSuccessToaster } from '../../shared/ui';

const languages = [
  { code: 'ru', label: 'settings.language.russian', nativeLabel: 'Русский', flag: '🇷🇺' },
  { code: 'en', label: 'settings.language.english', nativeLabel: 'English', flag: '🇬🇧' },
];

export const LanguageSelector = () => {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = async (lang: string) => {
    await i18n.changeLanguage(lang);
    await patchAppData({ language: lang });
    
    const langName = languages.find(l => l.code === lang)?.nativeLabel || lang;
    addSuccessToaster(
      t('settings.language.changed'),
      t('settings.language.changedDescription', { language: langName })
    );
  };

  return (
    <Card>
      <CardHeader className="flex gap-3">
        <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
          <Languages className="w-5 h-5 text-primary" />
        </div>
        <div className="flex flex-col">
          <h4 className="text-lg font-semibold">{t('settings.language.title')}</h4>
          <p className="text-sm text-default-500">{t('settings.language.description')}</p>
        </div>
      </CardHeader>
      
      <CardBody>
        <div className="grid grid-cols-2 gap-3">
          {languages.map((lang) => {
            const isActive = i18n.language === lang.code;
            
            return (
              <motion.div
                key={lang.code}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  fullWidth
                  variant={isActive ? 'solid' : 'bordered'}
                  color={isActive ? 'primary' : 'default'}
                  onPress={() => handleLanguageChange(lang.code)}
                  className="h-16"
                  startContent={
                    <span className="text-2xl">{lang.flag}</span>
                  }
                  endContent={
                    isActive && <Check className="w-4 h-4" />
                  }
                >
                  <div className="flex flex-col items-start">
                    <span className="font-semibold">{lang.nativeLabel}</span>
                  </div>
                </Button>
              </motion.div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
};
