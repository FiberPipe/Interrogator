import { ColumnDef, Table, useTable } from "@gravity-ui/table"
import { FBGGroupedItem, groupDataById } from "./utils";
import { useMemo } from "react";
import { SensorData } from "@shared/types/sensor-data";
import { TextInput } from "@gravity-ui/uikit";

import {
  Input,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";

interface FBGDataTableProps {
  data: SensorData[];
  handleInputChange: (key: string, value: string) => Promise<void>;
  inputs: Record<string, string>[];
}

const FBG_HEADER_CELL_NAMES = ["ID", "Avg", "Min", "Current", "Max"];


export const FBGDataTable = ({ data, handleInputChange, inputs }: FBGDataTableProps) => {
  const groupedData = groupDataById(data);

  const columns = useMemo<ColumnDef<FBGGroupedItem, any>[]>(
    () => [
      { header: FBG_HEADER_CELL_NAMES[0], accessorKey: "id", cell: ({ row }) => `FBG_${row.original.id}` },
      { header: FBG_HEADER_CELL_NAMES[1], accessorFn: () => 200 },
      {
        header: "Min", accessorKey: "rangeMin", cell: ({ row, getValue }) => (
          <TextInput
            value={String(inputs[`FBG_${row.original.id}_min`])}
            onUpdate={(val) => handleInputChange(`FBG_${row.original.id}_min`, val)}
          />
        )
      },
      { header: FBG_HEADER_CELL_NAMES[3], accessorKey: "wavelength" },
      { header: "Max", accessorKey: "rangeMax" },
    ],
    [inputs]
  );
  const table = useTable({ columns, data: groupedData });
  return <Table table={table} />
}