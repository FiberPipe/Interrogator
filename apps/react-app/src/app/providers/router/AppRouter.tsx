import { Suspense, useCallback } from "react";
import { Route, Routes } from "react-router-dom";
import { RouteCustomProps, routerConfig } from "./routerConfig";

export const AppRouter = () => {
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
