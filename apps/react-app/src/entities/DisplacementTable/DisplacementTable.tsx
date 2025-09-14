import {
  Input,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { Fragment, useEffect, useMemo } from "react";
import { TData, useInputStore } from "../../shared";
import { DISPLACEMENT_HEADER_CELL_NAMES } from "./utils";
import { groupDataById, GroupedItem } from "../utils";

type Props = {
  body: TData[];
  onDataPrepared?: (data: any[]) => void; // 👉 прокинем наверх для графика
};

export const DisplacementTable: React.FC<Props> = ({ body, onDataPrepared }) => {
  const groupedData = groupDataById(body);

  const { inputValues, updateInputValue, initializeInputValues, filePaths } =
    useInputStore();

  useEffect(() => {
    const fetchInputs = async () => {
      try {
        const inputData = await window.electron.getInputs();
        initializeInputValues(inputData);
      } catch (error) {
        console.error("Error fetching input data:", error);
      }
    };

    fetchInputs();
  }, [initializeInputValues]);

  const handleInputChange = async (key: string, value: string) => {
    updateInputValue(key, value);
    await window.electron.insertInput(key, value);
  };

  const calculateDisplacement = (d: GroupedItem) => {
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
            .map((d: GroupedItem) => (
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
