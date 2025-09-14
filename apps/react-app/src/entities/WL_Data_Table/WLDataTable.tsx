// WLDataTable.tsx
import React, { useEffect } from "react";
import {
  Input,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { TData, useInputStore } from "../../shared";
import { WL_HEADER_CELL_NAMES } from "./utils";
import { groupDataById, GroupedItem } from "../utils";

type Props = {
  body: TData[];
};

export const WLDataTable: React.FC<Props> = ({ body }) => {
  const { inputValues, updateInputValue, initializeInputValues } = useInputStore();

  // Группируем данные по ID сенсора
  const groupedData: GroupedItem[] = groupDataById(body);

  useEffect(() => {
    const fetchInputs = async () => {
      try {
        const inputs = await window.electron.getInputs();
        initializeInputValues(inputs);
      } catch (err) {
        console.error(err);
      }
    };
    fetchInputs();
  }, [initializeInputValues]);

  const handleInputChange = async (key: string, value: string) => {
    updateInputValue(key, value);
    await window.electron.insertInput(key, value);
  };

  return (
    <Table aria-label="Wavelength data table" style={{ width: "100%" }}>
      <TableHeader>
        {WL_HEADER_CELL_NAMES.map((header) => (
          <TableColumn key={header}>{header}</TableColumn>
        ))}
      </TableHeader>
      <TableBody>
        {groupedData
          .map((d) => {
            const minKey = `wavelength${d.id}_min`;
            const maxKey = `wavelength${d.id}_max`;

            return (
              <TableRow key={`WL_${d.id}`}>
                <TableCell>{`WL_${d.id}`}</TableCell>
                <TableCell>mE</TableCell>
                <TableCell>{d.rangeMin}</TableCell>
                <TableCell>
                  <Input
                    type="text"
                    value={inputValues[minKey] || ""}
                    onChange={(e) => handleInputChange(minKey, e.target.value)}
                  />
                </TableCell>
                <TableCell>{d.wavelength}</TableCell>
                <TableCell>
                  <Input
                    type="text"
                    value={inputValues[maxKey] || ""}
                    onChange={(e) => handleInputChange(maxKey, e.target.value)}
                  />
                </TableCell>
                <TableCell>{d.rangeMax}</TableCell>
              </TableRow>
            );
          })}
      </TableBody>
    </Table>
  );
};
