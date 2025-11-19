import { Fragment } from "react";
import {
  TableRow, Input,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
} from "@heroui/react";
import { GroupedWavelengthItem, TableProps } from "../../types";
import { groupDataByWavelengthId } from "../../utils";

interface DisplacementTableProps extends TableProps {
  onDataPrepared?: (data: any[]) => void; // 👉 прокинем наверх для графика
}

const DISPLACEMENT_HEADER_CELL_NAMES = [
  "ID",
  "λ₀ (нм)",
  "k",
  "C (мкм/(м·°C²))",
  "B (мкм/(м·°C))",
  "α (мкм/(м·°C))",
  "T (°C)",
  "T₀ (°C)",
  "Result (мкм/м)",
];


export const DisplacementTable: React.FC<DisplacementTableProps> = ({ body, inputValues, handleInputChange }) => {
  const groupedData = groupDataByWavelengthId(body);

  const calculateDisplacement = (d: GroupedWavelengthItem) => {
    const λ = d.wavelength;
    const λ0 = parseFloat(inputValues[`Displacement_lambda0_${d.id}`] || "0");
    const k = parseFloat(inputValues[`Displacement_k_${d.id}`] || "0");
    const C = parseFloat(inputValues[`Displacement_C_${d.id}`] || "0");
    const B = parseFloat(inputValues[`Displacement_B_${d.id}`] || "0");
    const alpha = parseFloat(inputValues[`Displacement_alpha_${d.id}`] || "0");
    const T = parseFloat(inputValues[`Displacement_T_${d.id}`] || "0");
    const T0 = parseFloat(inputValues[`Displacement_T0_${d.id}`] || "0");

    return (
      (Math.pow(10, 6) * (λ - λ0)) / (k * λ0) -
      C * (Math.pow(T, 2) - Math.pow(T0, 2)) -
      (B + alpha) * (T - T0)
    );
  };

  return (
    <Fragment>
      <div style={{ marginBottom: "20px" }}>
        <strong>Формула:</strong> ε = (10⁶ * (λ - λ₀)) / (k * λ₀) - C(T² - T₀²)
        - (B + α)(T - T₀)
      </div>
      <Table aria-label="Displacement sensors table" style={{ width: 400 }}>
        <TableHeader>
          {[...DISPLACEMENT_HEADER_CELL_NAMES].map((header: string) => (
            <TableColumn key={header}>{header}</TableColumn>
          ))}
        </TableHeader>
        <TableBody>
          {groupedData
            .filter((d) => inputValues?.sensorTypes?.[d.id] === "displacement")
            .map((d: GroupedWavelengthItem) => (
              <TableRow key={`Displacement_${d.id}`}>
                <TableCell>{`Displacement_${d.id}`}</TableCell>
                <TableCell>
                  <Input
                    type="text"
                    value={inputValues[`Displacement_lambda0_${d.id}`] || ""}
                    onChange={(e) =>
                      handleInputChange(
                        `Displacement_lambda0_${d.id}`,
                        e.target.value
                      )
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={inputValues[`Displacement_k_${d.id}`] || ""}
                    onChange={(e) =>
                      handleInputChange(
                        `Displacement_k_${d.id}`,
                        e.target.value
                      )
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="text"
                    value={inputValues[`Displacement_C_${d.id}`] || ""}
                    onChange={(e) =>
                      handleInputChange(
                        `Displacement_C_${d.id}`,
                        e.target.value
                      )
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="text"
                    value={inputValues[`Displacement_B_${d.id}`] || ""}
                    onChange={(e) =>
                      handleInputChange(
                        `Displacement_B_${d.id}`,
                        e.target.value
                      )
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="text"
                    value={inputValues[`Displacement_alpha_${d.id}`] || ""}
                    onChange={(e) =>
                      handleInputChange(
                        `Displacement_alpha_${d.id}`,
                        e.target.value
                      )
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="text"
                    value={inputValues[`Displacement_T_${d.id}`] || ""}
                    onChange={(e) =>
                      handleInputChange(
                        `Displacement_T_${d.id}`,
                        e.target.value
                      )
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="text"
                    value={inputValues[`Displacement_T0_${d.id}`] || ""}
                    onChange={(e) =>
                      handleInputChange(
                        `Displacement_T0_${d.id}`,
                        e.target.value
                      )
                    }
                  />
                </TableCell>
                <TableCell>{calculateDisplacement(d).toFixed(2)}</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </Fragment>
  );
};
