import { useState, useEffect, useCallback } from 'react';
import { addDangerToaster, addSuccessToaster } from '../../shared/ui';

const THEMES = [
  { key: 'light', label: 'Светлая' },
  { key: 'dark', label: 'Тёмная' },
];

export const useTheme = () => {
  const [theme, setTheme] = useState<string>('light');
  const [loading, setLoading] = useState(false);

  const loadTheme = useCallback(async () => {
    setLoading(true);
    try {
      const data = await window.appData.getAll();
      if (data?.theme) setTheme(data.theme as string);
    } catch (err) {
      addDangerToaster('Ошибка', 'Не удалось загрузить тему');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveTheme = useCallback(async (t: string) => {
    setTheme(t);
    setLoading(true);
    try {
      await window.appData.set('theme', t);
      addSuccessToaster('Тема сохранена', `Выбрана тема: ${t}`);
    } catch (err) {
      addDangerToaster('Ошибка', 'Не удалось сохранить тему');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  return { theme, setTheme: saveTheme, loading, THEMES };
};
