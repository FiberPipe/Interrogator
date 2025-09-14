import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";
import { SensorData } from "@shared/types/sensor-data";
import { TextInput } from "@gravity-ui/uikit";
import { groupDataById } from "../utils";


interface WLTableProps {
    data: SensorData[];
    inputs: Record<string, string>;
    handleInputChange: (key: string, value: string) => Promise<void>;
}

const WL_HEADER_CELL_NAMES = ["ID", "", "Range min", "Alarm min", "Current", "Alarm max", "Range max"];

export const WLTable = ({ data, inputs, handleInputChange }: WLTableProps) => {
    const groupedData = groupDataById(data);
    return (
        <Table
            aria-label="Wavelength Table"
            style={{
                width: "100%",
                borderCollapse: "collapse",
                border: "1px solid #ccc",
            }}
        >
            <TableHeader
                style={{
                    backgroundColor: "#f5f5f5",
                    fontWeight: 600,
                }}
            >
                {WL_HEADER_CELL_NAMES.map((header) => (
                    <TableColumn
                        key={header}
                        style={{
                            padding: "8px 12px",
                            borderBottom: "1px solid #ccc",
                            textAlign: "center",
                        }}
                    >
                        {header}
                    </TableColumn>
                ))}
            </TableHeader>

            <TableBody>
                {groupedData.map((d, idx) => (
                    <TableRow
                        key={`WL_${d.id}`}
                        style={{
                            backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f9f9f9",
                        }}
                    >
                        <TableCell style={{ textAlign: "center", padding: "6px 12px" }}>
                            {`WL_${d.id}`}
                        </TableCell>
                        <TableCell style={{ textAlign: "center" }}>mE</TableCell>
                        <TableCell style={{ textAlign: "center" }}>{d.rangeMin}</TableCell>

                        <TableCell style={{ textAlign: "center" }}>
                            <TextInput
                                value={inputs[`wl_${d.id}_min`] || ""}
                                onChange={(e) =>
                                    handleInputChange(`wl_${d.id}_min`, e.target.value)
                                }
                                style={{ width: 80 }}
                            />
                        </TableCell>

                        <TableCell style={{ textAlign: "center" }}>{d.wavelength}</TableCell>

                        <TableCell style={{ textAlign: "center" }}>
                            <TextInput
                                value={inputs[`wl_${d.id}_max`] || ""}
                                onChange={(e) =>
                                    handleInputChange(`wl_${d.id}_max`, e.target.value)
                                }
                                style={{ width: 80 }}
                            />
                        </TableCell>

                        <TableCell style={{ textAlign: "center" }}>{d.rangeMax}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};
