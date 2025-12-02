import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Button, Divider } from '@heroui/react';
import { AppRoutes } from '../shared/types/routes';
import { Settings, BarChart2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const menuItems = [
  { label: 'Настройки', icon: <Settings size={18} />, path: AppRoutes.SETTINGS },
  { label: 'Графики', icon: <BarChart2 size={18} />, path: AppRoutes.CHARTS },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [collapsed, setCollapsed] = useState(false);

  return (
    <Card
      className={`h-screen p-4 flex flex-col justify-between transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Menu items */}
      <div className="flex flex-col gap-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;

          return (
            <Button
              key={item.path}
              variant={isActive ? 'solid' : 'flat'}
              color={isActive ? 'primary' : 'default'}
              className={`justify-start gap-3 transition-all ${collapsed ? 'px-2' : ''}`}
              fullWidth
              onPress={() => navigate(item.path)}
              startContent={item.icon}
            >
              {!collapsed && item.label}
            </Button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-3">
        <Divider />

        {/* Документация */}
        <div className={`flex flex-col gap-2 text-sm ${collapsed ? 'hidden' : 'block'}`}>
          <a
            href="https://www.heroui.com/docs"
            target="_blank"
            className="text-primary hover:underline"
          >
            HeroUI Docs
          </a>
          <a
            href="https://reactrouter.com/en/main"
            target="_blank"
            className="text-primary hover:underline"
          >
            React Router Docs
          </a>
        </div>

        {/* Collapse button */}
        <Button
          variant="flat"
          fullWidth
          onPress={() => setCollapsed(!collapsed)}
          startContent={collapsed ? <ChevronRight /> : <ChevronLeft />}
        >
          {!collapsed && 'Свернуть'}
        </Button>
      </div>
    </Card>
  );
};

export default Sidebar;
