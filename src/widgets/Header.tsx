import { useState } from 'react';
import { Button } from '@heroui/button';
import {
  Navbar,
  NavbarBrand,
  NavbarMenu,
  NavbarMenuItem,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
} from '@heroui/navbar';
import { Switch } from '@heroui/switch';
import { MoonIcon, SunIcon } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <Navbar
      maxWidth="xl"
      isBordered
      onMenuOpenChange={setIsMenuOpen}
      className={`${darkMode ? 'dark' : ''}`}
    >
      {/* Left section — brand */}
      <NavbarContent>
        <NavbarMenuToggle className="sm:hidden" />

        <NavbarBrand className="cursor-pointer">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            MyApp
          </span>
        </NavbarBrand>
      </NavbarContent>

      {/* Center section — nav links */}
      <NavbarContent className="hidden sm:flex gap-6" justify="center">
        <NavbarItem>
          <a className="text-sm text-foreground hover:text-primary" href="#">
            Dashboard
          </a>
        </NavbarItem>
        <NavbarItem>
          <a className="text-sm text-foreground hover:text-primary" href="#">
            Settings
          </a>
        </NavbarItem>
        <NavbarItem>
          <a className="text-sm text-foreground hover:text-primary" href="#">
            Reports
          </a>
        </NavbarItem>
      </NavbarContent>

      {/* Right section — buttons */}
      <NavbarContent justify="end" className="gap-3">
        <Switch
          isSelected={darkMode}
          onValueChange={setDarkMode}
          size="sm"
          thumbIcon={({ isSelected }) =>
            isSelected ? <MoonIcon width={16} /> : <SunIcon width={16} />
          }
        />

        <Button color="primary" radius="full" variant="shadow" className="hidden sm:flex">
          Login
        </Button>
      </NavbarContent>

      {/* Mobile Menu */}
      <NavbarMenu>
        <NavbarMenuItem>
          <a className="w-full text-lg py-2" href="#">
            Dashboard
          </a>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <a className="w-full text-lg py-2" href="#">
            Settings
          </a>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <a className="w-full text-lg py-2" href="#">
            Reports
          </a>
        </NavbarMenuItem>

        <NavbarMenuItem className="mt-4">
          <Button color="primary" radius="full" fullWidth>
            Login
          </Button>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  );
}
