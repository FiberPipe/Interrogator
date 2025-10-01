"use client";

import { Button, Input } from "@heroui/react";

interface ChartControlsProps {
  yMin: "auto" | number;
  yMax: "auto" | number;
  setYMin: (value: "auto" | number) => void;
  setYMax: (value: "auto" | number) => void;
  resetScales: () => void;
}

export const ChartControls = ({
  yMin,
  yMax,
  setYMin,
  setYMax,
  resetScales,
}: ChartControlsProps) => {
  const parseNumber = (val: string): number | "auto" => {
    if (val.trim() === "") return "auto";
    const num = Number(val);
    return isNaN(num) ? "auto" : num;
  };

  return (
    <div className="flex flex-col gap-2 p-2 w-[10vw]">
      <Input
        type="number"
        placeholder="yMin"
        value={yMin === "auto" ? "" : String(yMin)}
        onChange={(e) => setYMin(parseNumber(e.target.value))}
        className=" py-0.5 rounded"
      />
      <Input
        type="number"
        placeholder="yMax"
        value={yMax === "auto" ? "" : String(yMax)}
        onChange={(e) => setYMax(parseNumber(e.target.value))}
        className=" py-0.5 rounded"
      />
      <Button
        onClick={resetScales}
        className="px-2 py-1 rounded hover:bg-gray-100"
      >
        Сбросить
      </Button>
    </div>
  );
};
