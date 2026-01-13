// hooks/useAppSettings.ts
import { useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';

export function useAppSettings() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ipcRenderer.invoke('app-data:get-all').then((data) => {
      setSettings(data);
      setLoading(false);
    });
  }, []);

  return { settings, loading };
}
