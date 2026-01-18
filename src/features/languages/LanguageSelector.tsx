import { Card, Select, SelectItem } from '@heroui/react';
import { useTranslation } from 'react-i18next';

import { useLanguage } from './useLanguage';

export const LanguageSelector = () => {
  const { language, setLanguage, loading, LANGUAGES } = useLanguage();
  const { t } = useTranslation();

  return (
    <Card className="p-6 flex flex-col gap-4">
      <h3 className="text-xl font-semibold">{t('language.title')}</h3>
      <p className="text-sm text-default-500">{t('language.description')}</p>

      <Select
        label="Язык"
        placeholder="Выберите язык"
        selectedKeys={[language]}
        onSelectionChange={(keys) => setLanguage(Array.from(keys)[0] as string)}
        disabled={loading}
      >
        {LANGUAGES.map((lang) => (
          <SelectItem key={lang.key}>{lang.label}</SelectItem>
        ))}
      </Select>
    </Card>
  );
};
