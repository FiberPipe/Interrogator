import { useEffect, useState } from 'react';

import { addDangerToaster } from '../../shared/ui';
import { appDataApi } from '../../shared/api/app-data.api';

export async function getAppData() {
  if (!appDataApi) throw new Error('appData IPC not available');
  return await appDataApi.getAll();
}

export async function patchAppData(patch: Record<string, unknown>) {
  if (!appDataApi) throw new Error('appData IPC not available');
  return await appDataApi.patch(patch);
}

export function useOnboarding() {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getAppData();
        setIsFirstLaunch(Boolean(data?.isFirstLaunch ?? true));
      } catch (err) {
        addDangerToaster('[useOnboarding] Error fetching app data:', err);
        setIsFirstLaunch(true); // fallback
      }
    }

    fetchData();
  }, []);

  return { isFirstLaunch, setIsFirstLaunch };
}

// Завершение онбординга
export async function finishOnboarding(
  data: Record<string, unknown>,
  setIsFirstLaunch?: (v: boolean) => void,
) {
  await patchAppData({
    ...data,
    isFirstLaunch: false,
  });

  // обновляем локальное состояние сразу
  if (setIsFirstLaunch) setIsFirstLaunch(false);
}
