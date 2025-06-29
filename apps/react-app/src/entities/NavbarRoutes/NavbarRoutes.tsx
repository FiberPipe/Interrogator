import { Button, Link, NavbarContent, NavbarItem } from "@nextui-org/react";
import { redirect, useLocation, useNavigate } from "react-router-dom";
import { DEFAULT_NAVBAR_ROUTES_LIST, getRouteColor } from "./utils";
import { Gear } from '@gravity-ui/icons';


export const NavbarRoutes: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
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

      <NavbarContent>
        <NavbarItem key={"settings"}>
          <Button isIconOnly aria-label="Settings" color="primary" onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.preventDefault(); navigate('/settings') }}>
            <Gear />
          </Button>
        </NavbarItem>
      </NavbarContent>
    </>
  );
};