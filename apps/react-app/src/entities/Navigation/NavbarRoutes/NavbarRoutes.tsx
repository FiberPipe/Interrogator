"use client";

import {
  NavbarContent,
  NavbarItem,
  Link,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { useLocation, useNavigate } from "react-router-dom";
import { Gear } from "@gravity-ui/icons";
import { DEFAULT_NAVBAR_ROUTES_LIST, getRouteColor } from "./utils";

const icons = {
  chevron: <svg fill="none" height={16} viewBox="0 0 24 24" width={16}>
    <path d="M19.92 8.95-6.52 6.52c-.77.77-2.03.77-2.8 0L4.08 8.95" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
  </svg>,
  scale: <svg fill="none" height={16} viewBox="0 0 24 24" width={16}>
    <path d="M9 22h6c5 0 7-2 7-7V9c0-5-2-7-7-7H9C4 2 2 4 2 9v6c0 5 2 7 7 7ZM18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
  </svg>,
};

export const NavbarRoutes: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <>
      {/* Основные ссылки */}
      <NavbarContent className="hidden sm:flex gap-4" justify="start">
        {DEFAULT_NAVBAR_ROUTES_LIST.map((route) => (
          <NavbarItem key={route.name}>
            <Link href={route.url} color={getRouteColor(pathname, route.url)}>
              {route.name}
            </Link>
          </NavbarItem>
        ))}

        {/* Dropdown пример */}
        <Dropdown>
          <NavbarItem>
            <DropdownTrigger>
              <Button
                disableRipple
                className="p-0 bg-transparent"
                endContent={icons.chevron}
                variant="light"
              >
                Features
              </Button>
            </DropdownTrigger>
          </NavbarItem>
          <DropdownMenu aria-label="features" itemClasses={{ base: "gap-2" }}>
            <DropdownItem key="autoscaling" startContent={icons.scale}>
              Autoscaling
            </DropdownItem>
            {/* Добавляй другие DropdownItem сюда */}
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>

      {/* Кнопка настроек */}
      <NavbarContent justify="end">
        <NavbarItem>
          <Button
            isIconOnly
            aria-label="Settings"
            color="primary"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              navigate("/settings");
            }}
          >
            <Gear />
          </Button>
        </NavbarItem>
      </NavbarContent>
    </>
  );
};
