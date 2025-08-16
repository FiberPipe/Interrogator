import { ChartsPage, Monitoring, Settings } from "@pages/index";
import { RootLayout } from "./RootLayout";
import type { RouteObject } from "react-router-dom";
import { GraphView, MapView } from "@widgets/index";

export const routerConfig: RouteObject[] = [
  {
    path: "/",
    element: <RootLayout />,
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
          {
            path: "charts",
            element: <ChartsPage />,
          }
        ],
      },
      {
        path: "settings",
        element: <Settings />,
        // children: [
        //   {
        //     index: true,
        //     element: <MainSettings />,
        //   },
        //   {
        //     path: "main",
        //     element: <MainSettings />,
        //   },
        //   {
        //     path: "connection",
        //     element: <ConnectionSettings />,
        //   },
        // ]
      },
      {
        path: "*",
        element: <h1>Not found</h1>,
      },
    ],
  },
];
