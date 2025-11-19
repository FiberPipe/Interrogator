"use client";

import { Input, Switch, Button } from "@heroui/react";
import { AutoOrNum } from "./ChartWrapper";

interface ScaleControlsProps {
  autoY: boolean;
  onAutoYChange: (on: boolean) => void;
  yMin: AutoOrNum;
  yMax: AutoOrNum;
  setYMin: (value: AutoOrNum) => void;
  setYMax: (value: AutoOrNum) => void;
  resetScales: () => void;
}

export const ScaleControls = ({
  autoY,
  onAutoYChange,
  yMin,
  yMax,
  setYMin,
  setYMax,
  resetScales,
}: ScaleControlsProps) => {
  const parseNumber = (val: string): number | "auto" => {
    if (val.trim() === "") return "auto";
    const num = Number(val);
    return isNaN(num) ? "auto" : num;
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between rounded-medium border border-default-200 px-3 py-2 bg-content2">
        <span className="text-small text-default-600">Авто Y</span>
        <Switch size="sm" isSelected={autoY} onValueChange={onAutoYChange} />
      </div>

      <Input
        size="sm"
        type="number"
        placeholder="yMin"
        value={yMin === "auto" ? "" : String(yMin)}
        onChange={(e) => setYMin(parseNumber(e.target.value))}
        isDisabled={autoY}
      />
      <Input
        size="sm"
        type="number"
        placeholder="yMax"
        value={yMax === "auto" ? "" : String(yMax)}
        onChange={(e) => setYMax(parseNumber(e.target.value))}
        isDisabled={autoY}
      />

      <Button size="sm" variant="flat" onPress={resetScales}>
        Сбросить
      </Button>
    </div>
  );
};
