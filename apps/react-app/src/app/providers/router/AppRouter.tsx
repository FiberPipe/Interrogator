import { Suspense, useCallback, useEffect, useRef } from "react";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { RouteCustomProps, routerConfig } from "./routerConfig";
import { useInputStore } from "../../../shared";

export const AppRouter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { filePaths, setFilePaths } = useInputStore();
  const initialCheckDone = useRef(false);

  useEffect(() => {
    const checkFilePath = async () => {
      if (initialCheckDone.current) return;
      
      const savedPaths = await window.electron.getFilePaths();
      
      if (savedPaths.sensorDataFilePath) {
        setFilePaths(savedPaths);
        initialCheckDone.current = true;
        return; 
      }
      
      if (location.pathname !== '/settings') {
        navigate('/settings');
      }
      
      initialCheckDone.current = true;
    };

    checkFilePath();
  }, [navigate, location.pathname, setFilePaths]);

  useEffect(() => {
    if (!initialCheckDone.current) return;
    
    if (!filePaths?.sensorDataFilePath && location.pathname !== '/settings') {
      navigate('/settings');
    }
  }, [filePaths, navigate, location.pathname]);

  const renderWithWrapper = useCallback((route: RouteCustomProps) => {
    const element = (
      <Suspense fallback={<h1>Loader</h1>}>{route.element}</Suspense>
    );

    return route.indexPage ? (
      <Route key={route.path} path={route.path} element={element}>
        <Route index element={route.indexPage} />
      </Route>
    ) : (
      <Route key={route.path} path={route.path} element={element} />
    );
  }, []);

  return (
    <Suspense fallback={<h1>Loader</h1>}>
      <Routes>{Object.values(routerConfig).map(renderWithWrapper)}</Routes>
    </Suspense>
  );
};
