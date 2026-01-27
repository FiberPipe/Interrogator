import { Routes, Route, Navigate } from 'react-router-dom';
import { HeroUIProvider } from '@heroui/react';
import { ToastProvider } from '@heroui/react';

import { ErrorWrapper } from './providers/ErrorWrapper';
import { useOnboarding } from './hooks/useOnboarding';
import { AppRoutes } from '../shared/types/routes';
import './styles/global.css';
import { SerialPortProvider } from './providers/SerialPortProvider';
import { ChartsPage, DashboardPage, LogsPage } from '../pages';
import Onboarding from '../pages/Onboarding';
import Settings from '../pages/Settings';
import { Sidebar } from '../widgets';

export default function App() {
  const { isFirstLaunch, setIsFirstLaunch } = useOnboarding();

  if (isFirstLaunch === null) return null;

  return (
    <HeroUIProvider>
      <ToastProvider
        toastProps={{
          radius: 'full',
          color: 'primary',
          variant: 'flat',
          timeout: 4000,
          hideIcon: true,
          classNames: {
            closeButton: 'opacity-100 absolute right-4 top-1/2 -translate-y-1/2',
          },
        }}
        placement="bottom-right"
      />
      <ErrorWrapper>
        <SerialPortProvider>
          {isFirstLaunch ? (
            <Onboarding setIsFirstLaunch={setIsFirstLaunch} />
          ) : (
            <div className="flex h-screen w-screen overflow-hidden bg-background">
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Routes>
                  <Route
                    path={AppRoutes.HOME}
                    element={<Navigate replace to={AppRoutes.SETTINGS} />}
                  />
                  <Route
                    path={AppRoutes.SETTINGS}
                    element={<Settings onReset={() => setIsFirstLaunch(true)} />}
                  />
                  <Route path={AppRoutes.CHARTS} element={<ChartsPage />} />
                  <Route path={AppRoutes.DASHBOARD} element={<DashboardPage />} />
                  <Route path={AppRoutes.LOGS} element={<LogsPage />} />
                  <Route path="*" element={<Navigate replace to={AppRoutes.SETTINGS} />} />
                </Routes>
              </div>
            </div>
          )}
        </SerialPortProvider>
      </ErrorWrapper>
    </HeroUIProvider>
  );
}
