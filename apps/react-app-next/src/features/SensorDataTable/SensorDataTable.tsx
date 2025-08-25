import React from "react";
import { Table, useTable } from "@gravity-ui/table";
import type { ColumnDef } from "@gravity-ui/table/tanstack";
import { useTemperatureCalculator } from "./useTemperatureCalculator";

interface TemperatureRow {
    id: string;
    wavelength: number;
    "λ₀": string;
    "E": string;
    "D": string;
    "C": string;
    "B": string;
    "A": string;
    temperature: number;
}


export const SensorDataTable: React.FC<{ data: TemperatureRow[] }> = ({ data }) => {
    const { calculateTemperature, handleInputChange, inputValues } =
        useTemperatureCalculator();

    const columns: ColumnDef<TemperatureRow>[] = [
        { accessorKey: "id", header: "ID", size: 80 },
        {
            accessorKey: "wavelength",
            header: "λ, nm",
            size: 100,
        },
        ...["λ₀", "E", "D", "C", "B", "A"].map((coef) => ({
            accessorKey: coef,
            header: coef,
            size: 100,
            cell: ({ row }) => (
                <input
                    type="text"
                    value={inputValues[`${coef}_${row.original.id}`] || ""}
                    onChange={(e) =>
                        handleInputChange(`${coef}_${row.original.id}`, e.target.value)
                    }
                    style={{ width: "80px" }}
                />
            ),
        })),
        {
            accessorKey: "temperature",
            header: "Temperature, °C",
            size: 120,
            cell: ({ row }) => {
                const t = calculateTemperature(row.original.wavelength, row.original.id);
                return t.toFixed(2);
            },
        },
    ];

    const table = useTable({
        columns,
        data,
        getRowId: (row) => row.id,
    });

    return <Table table={table} />;
};
