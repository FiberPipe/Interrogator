import { Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { routerConfig } from "./routerConfig";

const router = createBrowserRouter(routerConfig);

export const AppRouter = () => {
  return (
    <Suspense fallback={<h1>Loader</h1>}>
      <RouterProvider router={router} />
    </Suspense>
  );
};
