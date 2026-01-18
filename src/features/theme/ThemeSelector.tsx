import { Card, Select, SelectItem } from '@heroui/react';

import { useTheme } from './useTheme';

export const ThemeSelector = () => {
  const { theme, setTheme, loading, THEMES } = useTheme();

  return (
    <Card className="p-6 flex flex-col gap-4">
      <h3 className="text-xl font-semibold">Тема</h3>
      <p className="text-sm text-default-500">Выберите светлую или тёмную тему</p>

      <Select
        label="Тема"
        placeholder="Выберите тему"
        selectedKeys={[theme]}
        onSelectionChange={(keys) => setTheme(Array.from(keys)[0] as string)}
        disabled={loading}
      >
        {THEMES.map((t) => (
          <SelectItem key={t.key}>{t.label}</SelectItem>
        ))}
      </Select>
    </Card>
  );
};
