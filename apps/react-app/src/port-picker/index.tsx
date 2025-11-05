import React from "react";
import { createRoot } from "react-dom/client";
import { HeroUIProvider } from "@heroui/react";
import PortPickerApp from "./ui/PortPickerApp.tsx";
import "../app/styles/global.css";

const root = createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <HeroUIProvider>
      <PortPickerApp />
    </HeroUIProvider>
  </React.StrictMode>
);
