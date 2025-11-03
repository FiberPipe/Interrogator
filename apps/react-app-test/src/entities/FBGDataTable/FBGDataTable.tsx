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
import { FBG_HEADER_CELL_NAMES } from "./utils";
import { useEffect } from "react";
import { groupDataById, GroupedItem } from "../utils";

type Props = {
  body: TData[];
};
export const FBGDataTable: React.FC<Props> = ({ body }) => {
  const groupedData = groupDataById(body);

  const { inputValues, updateInputValue, initializeInputValues, filePaths } = useInputStore();


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
        {FBG_HEADER_CELL_NAMES.map((header: string) => (
          <TableColumn key={header}>{header}</TableColumn>
        ))}
      </TableHeader>
      <TableBody>
        {groupedData.map((d: GroupedItem) => (
          <TableRow key={`FBG_${d.id}`}>
            <TableCell>{`FBG_${d.id}`}</TableCell>
            <TableCell>200</TableCell>
            <TableCell>
              <Input
                value={inputValues[`FBG_${d.id}_min`] || ""}
                onChange={(e) =>
                  handleInputChange(`FBG_${d.id}_min`, e.target.value)
                }
              />
            </TableCell>
            <TableCell>{d.wavelength}</TableCell>
            <TableCell>
              <Input
                type="text"
                value={inputValues[`FBG_${d.id}_max`] || ""}
                onChange={(e) =>
                  handleInputChange(`FBG_${d.id}_max`, e.target.value)
                }
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
