import { Routes, Route, Navigate } from 'react-router-dom';
import { HeroUIProvider } from '@heroui/react';

import { ErrorWrapper } from './providers/ErrorWrapper';
import Settings from '../pages/Settings';
import { Charts } from '../pages';
import Onboarding from '../pages/Onboarding';
import { useOnboarding } from './hooks/useOnboarding';
import { AppRoutes } from '../shared/types/routes';
import './styles/global.css';
import Sidebar from '../widgets/Sidebar/ui/Sidebar';

export default function App() {
  const { isFirstLaunch, setIsFirstLaunch } = useOnboarding();

  if (isFirstLaunch === null) return null;

  return (
    <HeroUIProvider>
      <ErrorWrapper>
        {isFirstLaunch ? (
          <Onboarding setIsFirstLaunch={setIsFirstLaunch} />
        ) : (
          <div className="flex h-screen w-screen overflow-hidden bg-background">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Routes>
                <Route path={AppRoutes.HOME} element={<Navigate replace to={AppRoutes.SETTINGS} />} />
                <Route path={AppRoutes.SETTINGS} element={<Settings onReset={() => setIsFirstLaunch(true)} />} />
                <Route path={AppRoutes.CHARTS} element={<Charts />} />
                <Route path="*" element={<Navigate replace to={AppRoutes.SETTINGS} />} />
              </Routes>
            </div>
          </div>
        )}
      </ErrorWrapper>
    </HeroUIProvider>
  );
}
