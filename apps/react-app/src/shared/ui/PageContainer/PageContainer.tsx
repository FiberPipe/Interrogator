"use client";

import { ReactNode } from "react";

type TPageContainer = {
  children: ReactNode;
};

export const PageContainer = ({ children }: TPageContainer) => (
  <main className="w-full h-[85vh] px-4">
    {children}
  </main>
);
