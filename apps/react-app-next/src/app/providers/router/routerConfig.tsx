import { Monitoring, Settings } from "@pages/index";
import { RootLayout } from "./RootLayout";
import type { RouteObject } from "react-router-dom";
import { ChartsView, GraphView, MapView } from "@widgets/index";

export const routerConfig: RouteObject[] = [
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "settings",
        index: true,
        element: <Settings />,
      },
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
          {
            path: "charts",
            element: <ChartsView />,
          }
        ],
      },
      {
        path: "*",
        element: <h1>Not found</h1>,
      },
    ],
  },
];
