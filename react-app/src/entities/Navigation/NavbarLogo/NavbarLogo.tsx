"use client";

import { Logo } from "../../../shared/assets";

export const NavbarLogo: React.FC = () => {
  return (
    <div className="flex items-center justify-start h-full px-4">
      <img
        src={Logo}
        alt="Logo"
        className="w-[110px] h-[70px] object-contain"
      />
    </div>
  );
};
