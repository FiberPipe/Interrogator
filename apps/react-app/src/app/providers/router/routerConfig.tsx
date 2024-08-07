import { RouteProps } from "react-router-dom";
import { AcquisitionPage, SensorsPage } from "../../../pages";
import { ChartsPage } from "../../../pages/Charts/ChartsPage";

type CustomRouteProps = {
  indexPage?: JSX.Element;
};

export type RouteCustomProps = RouteProps & CustomRouteProps;

export const routerConfig: Array<RouteCustomProps> = [
  {
    path: "/",
    element: <AcquisitionPage />,
    caseSensitive: false,
  },
  {
    path: "/sensors",
    element: <SensorsPage />,
    caseSensitive: false,
  },
  { path: "/charts", element: <ChartsPage />, caseSensitive: false },
  {
    path: "*",
    element: <h1>Not found</h1>,
  },
];
