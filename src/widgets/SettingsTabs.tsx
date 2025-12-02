import { Button } from "@heroui/react";

interface SettingsTabsProps {
  activeSection: string;
  onSelect: (section: string) => void;
}

export const SettingsTabs = ({ activeSection, onSelect }: SettingsTabsProps) => {
  return (
    <div className="flex flex-col w-60 gap-2 border-r border-default-200 pr-4">
      <Button
        variant={activeSection === "main" ? "solid" : "flat"}
        onPress={() => onSelect("main")}
      >
        Основные
      </Button>
      <Button
        variant={activeSection === "sensors" ? "solid" : "flat"}
        onPress={() => onSelect("sensors")}
      >
        Настройка датчиков
      </Button>
    </div>
  );
};
