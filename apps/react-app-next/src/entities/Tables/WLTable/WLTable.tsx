import { Input, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";
import { SensorData } from "@shared/types/sensor-data";
import { groupDataById } from "./utils";
import { Button, Flex, Icon, TextInput } from "@gravity-ui/uikit";
import { FloppyDisk } from "@gravity-ui/icons";

export interface WLGroupedItem {
    id: number;
    wavelength: number;
    rangeMin?: number;
    rangeMax?: number;
}


interface WLTableProps {
    data: SensorData[];
    inputs: Record<string, string>;
    handleInputChange: (key: string, value: string) => Promise<void>;
}

const WL_HEADER_CELL_NAMES = ["ID", "", "Range min", "Alarm min", "Current", "Alarm max", "Range max"];

// // Редактируемая ячейка с локальным состоянием
// const EditableCell = ({
//     initialValue,
//     onSave,
// }: {
//     initialValue?: string;
//     onSave: (val: string) => void;
// }) => {
//     const [localValue, setLocalValue] = useState(initialValue || "");
//     const [savedValue, setSavedValue] = useState(initialValue || "");
//     const [isFocused, setIsFocused] = useState(false);

//     // обновляем локальное состояние только если input не в фокусе
//     useEffect(() => {
//         if (!isFocused) {
//             setLocalValue(initialValue || "");
//             setSavedValue(initialValue || "");
//         }
//     }, [initialValue, isFocused]);

//     const isChanged = localValue !== savedValue;

//     const handleSave = () => {
//         setSavedValue(localValue);
//         onSave(localValue);
//     };

//     return (
//         <Flex gap={2} alignItems="center">
//             <TextInput
//                 value={localValue}
//                 onChange={(e) => setLocalValue(e.target.value)}
//                 onFocus={() => setIsFocused(true)}
//                 onBlur={() => setIsFocused(false)}
//             />
//             <Button
//                 size="s"
//                 view="action"
//                 onClick={handleSave}
//                 style={{ visibility: isChanged ? "visible" : "hidden", minWidth: 40 }}
//             >
//                 <Icon data={FloppyDisk} size={20} />
//             </Button>
//         </Flex>
//     );
// };

// export const WLTable = ({ data, inputs, handleInputChange }: WLTableProps) => {
//     const groupedData = groupDataById(data);

//     const columns = useMemo<ColumnDef<WLGroupedItem, any>[]>(
//         () => [
//             {
//                 header: WL_HEADER_CELL_NAMES[0],
//                 accessorKey: "id",
//                 cell: ({ row }) => `WL_${row.original.id}`,
//             },
//             {
//                 header: WL_HEADER_CELL_NAMES[1],
//                 accessorKey: "rangeMin",
//             },
//             {
//                 header: WL_HEADER_CELL_NAMES[2],
//                 accessorKey: "alarmMin",
//                 cell: ({ row }) => {
//                     const key = `WL_${row.original.id}_min`;
//                     return (
//                         <EditableCell
//                             initialValue={inputs[key]}
//                             onSave={(val) => handleInputChange(key, val)}
//                         />
//                     );
//                 },
//             },
//             {
//                 header: WL_HEADER_CELL_NAMES[3],
//                 accessorKey: "wavelength",
//             },
//             {
//                 header: WL_HEADER_CELL_NAMES[4],
//                 accessorKey: "alarmMax",
//                 cell: ({ row }) => {
//                     const key = `WL_${row.original.id}_max`;
//                     return (
//                         <EditableCell
//                             initialValue={inputs[key]}
//                             onSave={(val) => handleInputChange(key, val)}
//                         />
//                     );
//                 },
//             },
//             {
//                 header: WL_HEADER_CELL_NAMES[5],
//                 accessorKey: "rangeMax",
//             },
//         ],
//         [] // больше не зависит от inputs — предотвращаем ререндер всей таблицы
//     );

//     const table = useTable({
//         columns,
//         data: groupedData,
//     });

//     return <Table table={table} />;
// };


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
