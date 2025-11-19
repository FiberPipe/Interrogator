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
import { groupDataByPowerId } from "../../utils";

interface PowerTableProps extends TableProps { }

export const POWER_HEADER_CELL_NAMES = [
    "ID",
    "Range min",
    "Alarm min",
    "Current",
    "Alarm max",
    "Range max",
];

export const PowerTable: React.FC<PowerTableProps> = ({
    body,
    inputValues,
    handleInputChange,
}) => {
    const groupedData = groupDataByPowerId(body);

    return (
        <Table aria-label="Power data table" className="w-full">
            <TableHeader>
                {POWER_HEADER_CELL_NAMES.map((header) => (
                    <TableColumn key={header}>{header}</TableColumn>
                ))}
            </TableHeader>
            <TableBody>
                {groupedData.map((d) => {
                    const minKey = `power${d.id}_min`;
                    const maxKey = `power${d.id}_max`;

                    return (
                        <TableRow key={`POWER_${d.id}`}>
                            <TableCell>{`P_${d.id}`}</TableCell>
                            <TableCell>{d.rangeMin}</TableCell>
                            <TableCell>
                                <Input
                                    type="text"
                                    value={inputValues[minKey] || ""}
                                    onChange={(e) => handleInputChange(minKey, e.target.value)}
                                />
                            </TableCell>
                            <TableCell>{d.currentValue}</TableCell>
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
