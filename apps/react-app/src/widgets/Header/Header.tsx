import { Button, Navbar } from "@heroui/react";
import { NavbarLogo, NavbarRoutes } from "../../entities";

export const Header: React.FC = () => {

  return (
    <Navbar isBordered>
      <NavbarLogo />
      <NavbarRoutes />
    </Navbar>
  );
};
