import React from "react";
import {
  Input,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";

import { TableProps } from "../../types";
import { groupDataByWavelengthId } from "../../utils";

interface WavelengthTableProps extends TableProps {}

export const WL_HEADER_CELL_NAMES = [
  "ID",
  "Range min",
  "Alarm min",
  "Current",
  "Alarm max",
  "Range max",
];

export const WavelengthTable: React.FC<WavelengthTableProps> = ({ body, inputValues, handleInputChange }) => {
   const groupedData = groupDataByWavelengthId(body);
   
  return (
    <Table aria-label="Wavelength data table" className="w-full">
      <TableHeader>
        {WL_HEADER_CELL_NAMES.map((header) => (
          <TableColumn key={header}>{header}</TableColumn>
        ))}
      </TableHeader>
      <TableBody>
        {groupedData.map((d) => {
          const minKey = `wavelength${d.id}_min`;
          const maxKey = `wavelength${d.id}_max`;

          return (
            <TableRow key={`WL_${d.id}`}>
              <TableCell>{`WL_${d.id}`}</TableCell>
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
