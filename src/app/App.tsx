import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import './styles/global.css';
import { HeroUIProvider, ToastProvider } from '@heroui/react';

import { ErrorWrapper } from './providers/ErrorWrapper';
import { AppRoutes } from '../shared/types/routes';
import { Charts } from '../pages';
import Sidebar from '../widgets/Sidebar';
import Settings from '../pages/Settings';

const App = () => {
  const navigate = useNavigate();

  return (
    <HeroUIProvider navigate={navigate}>
      <ErrorWrapper>
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Routes>
              <Route path={AppRoutes.HOME} element={<Navigate replace to={AppRoutes.SETTINGS} />} />
              <Route path={AppRoutes.SETTINGS} element={<Settings />} />
              <Route path={AppRoutes.CHARTS} element={<Charts />} />
            </Routes>
          </div>
        </div>
        <ToastProvider />
      </ErrorWrapper>
    </HeroUIProvider>
  );
};

export default App;
