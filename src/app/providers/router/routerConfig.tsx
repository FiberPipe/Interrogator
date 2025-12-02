import { RouteProps } from 'react-router-dom';
import { SensorsPage, Settings } from '../../../pages';
import { JSX } from 'react';

type CustomRouteProps = {
  indexPage?: JSX.Element;
};

export type RouteCustomProps = RouteProps & CustomRouteProps;

export const routerConfig: Array<RouteCustomProps> = [
  {
    path: '/',
    element: <Settings />,
    caseSensitive: false,
  },
  { path: '/settings', element: <Settings />, caseSensitive: false },
  { path: '/sensors', element: <SensorsPage />, caseSensitive: false },
  {
    path: '*',
    element: <h1>Not found</h1>,
  },
];
