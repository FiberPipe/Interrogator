import { BarChart2, Code, LayoutDashboard, Settings } from 'lucide-react';

import { AppRoutes } from '../../../shared/types/routes';

export const menuItems = [
  {
    id: 'settings',
    labelKey: 'navigation.settings',
    icon: Settings,
    path: AppRoutes.SETTINGS,
  },
  {
    id: 'charts',
    labelKey: 'navigation.charts',
    icon: BarChart2,
    path: AppRoutes.CHARTS,
  },
  {
    id: 'dashboard',
    labelKey: 'navigation.dashboard',
    icon: LayoutDashboard,
    path: AppRoutes.DASHBOARD,
    badge: 'beta',
  },
  {
    id: 'logs',
    labelKey: 'navigation.logs',
    icon: Code,
    path: AppRoutes.LOGS,
    badge: 'beta',
  },
];

export const documentationLinks = [];
