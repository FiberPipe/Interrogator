import { BarChart2, LayoutDashboard, Map, Settings } from 'lucide-react';
import { AppRoutes } from '../../../shared/types/routes';

export const menuItems = [
    {
        id: 'settings',
        labelKey: 'navigation.settings',
        icon: Settings,
        path: AppRoutes.SETTINGS
    },
    {
        id: 'charts',
        labelKey: 'navigation.charts',
        icon: BarChart2,
        path: AppRoutes.CHARTS
    },
    {
        id: 'dashboard',
        labelKey: 'navigation.dashboard',
        icon: LayoutDashboard,
        path: AppRoutes.DASHBOARD,
        badge: 'beta',
    },
];

export const documentationLinks = [
  {
    label: 'HeroUI Docs',
    url: 'https://www.heroui.com/docs',
  },
  {
    label: 'React Router Docs',
    url: 'https://reactrouter.com/en/main',
  },
];
