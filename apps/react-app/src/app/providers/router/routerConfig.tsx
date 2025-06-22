import { RouteProps } from "react-router-dom";
import {
  AcquisitionPage,
  ChartsPage,
  Power,
  SensorsPage,
  Beta,
} from "../../../pages";
import WavelengthDisplacementChart from "../../../pages/Displacement/Displacement";

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
  { path: "/power", element: <Power />, caseSensitive: false },
  { path: "/displacement", element: <WavelengthDisplacementChart />, caseSensitive: false },
  { path: "/beta", element: <Beta />, caseSensitive: false },
  {
    path: "*",
    element: <h1>Not found</h1>,
  },
];
