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
import { groupDataById, GroupedItem, WL_HEADER_CELL_NAMES } from "./utils";

type Props = {
  body: TData[];
};

export const WLDataTable: React.FC<Props> = ({ body }) => {
  const groupedData = groupDataById(body);
  const { inputValues, updateInputValue } = useInputStore();

  const handleInputChange = (key: string, value: string) => {
    updateInputValue(key, value);
  };

  return (
    <Table aria-label="Example static collection table" style={{ width: 400 }}>
      <TableHeader>
        {WL_HEADER_CELL_NAMES.map((header: string) => (
          <TableColumn key={header}>{header}</TableColumn>
        ))}
      </TableHeader>
      <TableBody>
        {groupedData.map((d: GroupedItem) => (
          <TableRow key={`WL_${d.id}`}>
            <TableCell>{`${d.id}_WL`}</TableCell>
            <TableCell>mE</TableCell>
            <TableCell>{d.rangeMax}</TableCell>
            <TableCell>
              <Input
                type="text"
                value={inputValues[`wl_${d.id}_min`] || ""}
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
                  handleInputChange(`wl_${d.id}_max`, e.target.value)
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
