import {
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
} from "@nextui-org/react";
import { Fragment } from "react";
import { SensorData } from "@shared/types/sensor-data";
import { groupDataById } from "../utils";
import { TableGroupedItem } from "../types";
import { TextInput } from "@gravity-ui/uikit";
import "./TemperatureTable.scss";

interface TemperatureTableProps {
    data: SensorData[];
    inputs: Record<string, string>;
    handleInputChange: (key: string, value: string) => Promise<void>;
}

const TEMPERATURE_HEADER_CELL_NAMES = [
    "ID",
    "λ₀ (нм)",
    "E (°С/нм⁴)",
    "D (°С/нм³)",
    "C (°С/нм²)",
    "B (°С/нм)",
    "A (°С)",
    "Result (°С)",
];

export const TemperatureTable = ({
    data,
    inputs,
    handleInputChange,
}: TemperatureTableProps) => {
    const groupedData = groupDataById(data);

    const calculateTemperature = (d: TableGroupedItem) => {
        const λ = d.wavelength;
        const λ0 = parseFloat(inputs[`Temp_λ₀_${d.id}`] || "0");
        const E = parseFloat(inputs[`Temp_E_${d.id}`] || "0");
        const D = parseFloat(inputs[`Temp_D_${d.id}`] || "0");
        const C = parseFloat(inputs[`Temp_C_${d.id}`] || "0");
        const B = parseFloat(inputs[`Temp_B_${d.id}`] || "0");
        const A = parseFloat(inputs[`Temp_A_${d.id}`] || "0");

        return (
            E * Math.pow(λ - λ0, 4) +
            D * Math.pow(λ - λ0, 3) +
            C * Math.pow(λ - λ0, 2) +
            B * (λ - λ0) +
            A
        );
    };

    return (
        <Fragment>
            <div className="formula">
                <strong>Формула:</strong>{" "}
                <span>T = E(λ - λ₀)⁴ + D(λ - λ₀)³ + C(λ - λ₀)² + B(λ - λ₀) + A</span>
            </div>

            <div className="temperature-table-wrapper">
                <Table aria-label="Temperature calculation table" removeWrapper>
                    <TableHeader>
                        {TEMPERATURE_HEADER_CELL_NAMES.map((header) => (
                            <TableColumn key={header}>{header}</TableColumn>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {groupedData.map((d: TableGroupedItem) => (
                            <TableRow key={`Temp_${d.id}`}>
                                <TableCell>{`Temp_${d.id}`}</TableCell>

                                <TableCell>
                                    <TextInput
                                        value={inputs[`Temp_λ₀_${d.id}`] || ""}
                                        onChange={(e) =>
                                            handleInputChange(
                                                `Temp_λ₀_${d.id}`,
                                                e.target.value
                                            )
                                        }
                                    />
                                </TableCell>

                                <TableCell>
                                    <TextInput
                                        value={inputs[`Temp_E_${d.id}`] || ""}
                                        onChange={(e) =>
                                            handleInputChange(
                                                `Temp_E_${d.id}`,
                                                e.target.value
                                            )
                                        }
                                    />
                                </TableCell>

                                <TableCell>
                                    <TextInput
                                        value={inputs[`Temp_D_${d.id}`] || ""}
                                        onChange={(e) =>
                                            handleInputChange(
                                                `Temp_D_${d.id}`,
                                                e.target.value
                                            )
                                        }
                                    />
                                </TableCell>

                                <TableCell>
                                    <TextInput
                                        value={inputs[`Temp_C_${d.id}`] || ""}
                                        onChange={(e) =>
                                            handleInputChange(
                                                `Temp_C_${d.id}`,
                                                e.target.value
                                            )
                                        }
                                    />
                                </TableCell>

                                <TableCell>
                                    <TextInput
                                        value={inputs[`Temp_B_${d.id}`] || ""}
                                        onChange={(e) =>
                                            handleInputChange(
                                                `Temp_B_${d.id}`,
                                                e.target.value
                                            )
                                        }
                                    />
                                </TableCell>

                                <TableCell>
                                    <TextInput
                                        value={inputs[`Temp_A_${d.id}`] || ""}
                                        onChange={(e) =>
                                            handleInputChange(
                                                `Temp_A_${d.id}`,
                                                e.target.value
                                            )
                                        }
                                    />
                                </TableCell>

                                <TableCell className="result">
                                    {calculateTemperature(d).toFixed(2)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </Fragment>
    );
};
