import { Button, Navbar } from "@nextui-org/react";
import { NavbarLogo, NavbarRoutes } from "../../entities";

export const Header: React.FC = () => {

  return (
    <Navbar isBordered>
      <NavbarLogo />
      <NavbarRoutes />
    </Navbar>
  );
};
