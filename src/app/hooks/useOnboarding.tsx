import { useEffect, useState } from 'react';

export async function getAppData() {
  if (!window.appData) throw new Error('appData IPC not available');
  return await window.appData.getAll();
}

export async function patchAppData(patch: Record<string, unknown>) {
  if (!window.appData) throw new Error('appData IPC not available');
  return await window.appData.patch(patch);
}

export function useOnboarding() {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getAppData();
        setIsFirstLaunch(Boolean(data?.isFirstLaunch ?? true));
      } catch (err) {
        console.error('[useOnboarding] Error fetching app data:', err);
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
