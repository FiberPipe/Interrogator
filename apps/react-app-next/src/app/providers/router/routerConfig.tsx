import { ChartsPage, InterrogatorSettings, Monitoring, NotFoundPage, Settings } from "@pages/index";
import { RootLayout } from "./RootLayout";
import type { RouteObject } from "react-router-dom";
import { GraphView, MapView } from "@widgets/index";
import { RouterErrorFallback } from "../AppErrorBoundary";
import { LogsPage } from "@pages/Logger/Logger";

export const routerConfig: RouteObject[] = [
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <RouterErrorFallback />,
    children: [
      {
        path: "monitoring",
        element: <Monitoring />,
        children: [
          {
            index: true,
            element: <MapView />,
          },
          {
            path: "map",
            element: <MapView />,
          },
          {
            path: "graphs",
            element: <GraphView />,
          },
        ],
      },
      {
        path: "charts",
        element: <ChartsPage />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "logs",
        element: <LogsPage/>,
      },
      {
        path: "interrogator-settings",
        element: <InterrogatorSettings />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
];
