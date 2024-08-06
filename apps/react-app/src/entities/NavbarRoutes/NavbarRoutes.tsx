import { Link, NavbarContent, NavbarItem } from "@nextui-org/react";
import { useLocation } from "react-router-dom";
import { DEFAULT_NAVBAR_ROUTES_LIST, getRouteColor } from "./utils";

export const NavbarRoutes: React.FC = () => {
  const { pathname } = useLocation();
  return (
    <>
      <NavbarContent className="hidden sm:flex gap-4" justify="start">
        {DEFAULT_NAVBAR_ROUTES_LIST.map((route) => (
          <NavbarItem key={route.name}>
            <Link href={route.url} color={getRouteColor(pathname, route.url)}>
              <p className="font-bold text-inherit">{route.name}</p>
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>
    </>
  );
};
