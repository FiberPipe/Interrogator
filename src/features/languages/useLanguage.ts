import { useState, useEffect, useCallback } from 'react';
import { addDangerToaster, addSuccessToaster } from '../../shared/ui';
import i18n from '../../shared/i18n';

const LANGUAGES = [
  { key: 'en', label: 'English' },
  { key: 'ru', label: 'Русский' },
  { key: 'es', label: 'Español' },
];

export const useLanguage = () => {
  const [language, setLanguage] = useState<string>('en');
  const [loading, setLoading] = useState(false);

  const loadLanguage = useCallback(async () => {
    setLoading(true);
    try {
      const data = await window.appData.getAll();
      if (data?.language) setLanguage(data.language as string);
    } catch (err) {
      addDangerToaster('Ошибка', 'Не удалось загрузить язык');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveLanguage = useCallback(async (lang: string) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
    setLoading(true);
    try {
      await window.appData.set('language', lang);
      addSuccessToaster('Язык сохранён', `Выбран язык: ${lang}`);
    } catch (err) {
      addDangerToaster('Ошибка', 'Не удалось сохранить язык');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLanguage();
  }, [loadLanguage]);

  return { language, setLanguage: saveLanguage, loading, LANGUAGES };
};
