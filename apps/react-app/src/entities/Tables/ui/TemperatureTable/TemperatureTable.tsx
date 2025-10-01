import {
  Input,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { Fragment } from "react";
import { GroupedWavelengthItem, TableProps } from "../../types";
import { groupDataByWavelengthId } from "../../utils";

interface TemperatureTableProps extends TableProps { };

export const TEMPERATURE_HEADER_CELL_NAMES = [
  "ID",
  "λ₀ (нм)",
  "E (°С/нм⁴)",
  "D (°С/нм³)",
  "C (°С/нм²)",
  "B (°С/нм)",
  "A (°С)",
  "Result (°С)",
];


export const TemperatureTable: React.FC<TemperatureTableProps> = ({ body, inputValues, handleInputChange }) => {
  const groupedData = groupDataByWavelengthId(body);

  const calculateTemperature = (d: GroupedWavelengthItem) => {
    const λ = parseFloat(d.wavelength as any);
    const λ0 = parseFloat(inputValues[`Temp_λ₀_${d.id}`] || "0");
    const E = parseFloat(inputValues[`Temp_E_${d.id}`] || "0");
    const D = parseFloat(inputValues[`Temp_D_${d.id}`] || "0");
    const C = parseFloat(inputValues[`Temp_C_${d.id}`] || "0");
    const B = parseFloat(inputValues[`Temp_B_${d.id}`] || "0");
    const A = parseFloat(inputValues[`Temp_A_${d.id}`] || "0");

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
      <div style={{ marginBottom: "20px" }}>
        <strong>Формула:</strong> T = E(λ - λ₀)⁴ + D(λ - λ₀)³ + C(λ - λ₀)² + B(λ
        - λ₀) + A
      </div>
      <Table
        aria-label="Example static collection table"
        style={{ width: 400 }}
      >
        <TableHeader>
          {[...TEMPERATURE_HEADER_CELL_NAMES].map((header: string) => (
            <TableColumn key={header}>{header}</TableColumn>
          ))}
        </TableHeader>
        <TableBody>
          {groupedData
            .filter((d) => inputValues?.sensorTypes?.[d.id] !== "displacement")
            .map((d: GroupedWavelengthItem) => (
              <TableRow key={`Temp_${d.id}`}>
                <TableCell>{`Temp_${d.id}`}</TableCell>
                <TableCell>
                  <Input
                    type="text"
                    value={inputValues[`Temp_λ₀_${d.id}`] || ""}
                    onChange={(e) =>
                      handleInputChange(`Temp_λ₀_${d.id}`, e.target.value)
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={inputValues[`Temp_E_${d.id}`] || ""}
                    onChange={(e) =>
                      handleInputChange(`Temp_E_${d.id}`, e.target.value)
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="text"
                    value={inputValues[`Temp_D_${d.id}`] || ""}
                    onChange={(e) =>
                      handleInputChange(`Temp_D_${d.id}`, e.target.value)
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="text"
                    value={inputValues[`Temp_C_${d.id}`] || ""}
                    onChange={(e) =>
                      handleInputChange(`Temp_C_${d.id}`, e.target.value)
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="text"
                    value={inputValues[`Temp_B_${d.id}`] || ""}
                    onChange={(e) =>
                      handleInputChange(`Temp_B_${d.id}`, e.target.value)
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="text"
                    value={inputValues[`Temp_A_${d.id}`] || ""}
                    onChange={(e) =>
                      handleInputChange(`Temp_A_${d.id}`, e.target.value)
                    }
                  />
                </TableCell>
                <TableCell>{calculateTemperature(d).toFixed(2)}</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </Fragment>
  );
};
