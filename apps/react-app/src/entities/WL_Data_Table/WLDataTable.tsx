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
import { TData } from "../../shared";
import { groupDataById, GroupedItem, WL_HEADER_CELL_NAMES } from "./utils";
import { useInputStore } from "../../shared";

type Props = {
  body: TData[];
};

export const WLDataTable: React.FC<Props> = ({ body }) => {
  const groupedData = groupDataById(body);
  const { inputValues, updateInputValue, initializeInputValues, filePaths } =
    useInputStore();

  useEffect(() => {
    const fetchInputs = async () => {
      try {
        console.log("Fetching input data...");
        const inputData = await window.electron.getInputs();
        console.log("Fetched input data:", inputData);

        initializeInputValues(inputData);
      } catch (error) {
        console.error("Error fetching input data:", error);
      }
    };

    fetchInputs();
  }, [initializeInputValues]); // Убедитесь, что зависимость правильная

  const handleInputChange = async (key: string, value: string) => {
    updateInputValue(key, value);
    await window.electron.insertInput(key, value);
  };

  console.log("Current input values:", inputValues); // Добавим отладочный вывод
  return (
    <Table aria-label="Example static collection table" style={{ width: 400 }}>
      <TableHeader>
        {WL_HEADER_CELL_NAMES.map((header) => (
          <TableColumn key={header}>{header}</TableColumn>
        ))}
      </TableHeader>
      <TableBody>
        {groupedData.map((d: GroupedItem) => (
          <TableRow key={`WL_${d.id}`}>
            <TableCell>{`WL_${d.id}`}</TableCell>
            <TableCell>mE</TableCell>
            <TableCell>{d.rangeMax}</TableCell>
            <TableCell>
              <Input
                type="text"
                value={inputValues[`wl_${d}_min`] || ""}
                onChange={(e) =>
                  handleInputChange(`wl_${d.id}_min`, e.target.value)
                }
              />
            </TableCell>
            <TableCell>{d.wavelength}</TableCell>
            <TableCell>
              <Input
                type="text"
                value={inputValues[`wl_${d.id}_max`] || ""}
                onChange={(e) =>
                  handleInputChange(
                    `wl_${d.id}_max`,

                    e.target.value
                  )
                }
              />
            </TableCell>
            <TableCell>{d.rangeMin}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
