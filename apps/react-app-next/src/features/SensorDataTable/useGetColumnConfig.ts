import { ChartType } from "@shared/types/charts";
import { useMemo } from "react";

const configs: Record<string, TableCellConfig[]> = {
  temperature: [
    { id: "E (°С/нм⁴)", hasInput: true },
    { id: "D (°С/нм³)", hasInput: true },
    { id: "C (°С/нм²)", hasInput: true },
    { id: "B (°С/нм)", hasInput: true },
    { id: "A (°С)", hasInput: true },
    { id: "λ₀ (нм)", hasInput: true },
    { id: "Result (°С)"},
  ],

  fbg: [
    { id: "Range min"},
    { id: "Alarm min", hasInput: true },
    { id: "Current"}, 
    { id: "Alarm max", hasInput: true },
    { id: "Range max"},
  ],

  wavelength: [
    { id: "Range min"},
    { id: "Alarm min", hasInput: true },
    { id: "Current"},
    { id: "Alarm max", hasInput: true },
    { id: "Range max"},
  ],
};

export const useGetColumnConfig = (type: ChartType) => {

    const result = useMemo(() => {
        return configs[type]
    }, [type]);

    return {config: result}
}