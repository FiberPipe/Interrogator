import { NavbarBrand, NavbarContent } from "@heroui/react";
import { Logo } from "../../shared/assets";
import styles from "./Navbar.module.css";

export const NavbarLogo: React.FC = () => {
  return (
    <NavbarContent justify="start">
      <NavbarBrand>
        <img src={Logo} alt="Logo" className={styles.image} />
      </NavbarBrand>
    </NavbarContent>
  );
};
