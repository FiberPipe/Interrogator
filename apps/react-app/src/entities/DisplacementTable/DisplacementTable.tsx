import {
  Input,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { useState, Fragment, useEffect } from "react";
import { TData, useInputStore } from "../../shared";
import {
  DISPLACEMENT_HEADER_CELL_NAMES,
  groupDataById,
  GroupedItem,
} from "./utils";

type Props = {
  body: TData[];
};

export const DisplacementTable: React.FC<Props> = ({ body }) => {
  const groupedData = groupDataById(body);

  const { inputValues, updateInputValue, initializeInputValues } =
    useInputStore();

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

  const calculateDisplacement = (d: GroupedItem) => {
    const λ = d.wavelength;
    const λ0 = parseFloat(inputValues[`Displacement_lambda0_${d.id}`] || "0");
    const k = parseFloat(inputValues[`Displacement_k_${d.id}`] || "0");
    const C = parseFloat(inputValues[`Displacement_C_${d.id}`] || "0");
    const B = parseFloat(inputValues[`Displacement_B_${d.id}`] || "0");
    const alpha = parseFloat(inputValues[`Displacement_alpha_${d.id}`] || "0");
    const T = parseFloat(inputValues[`Displacement_T_${d.id}`] || "0");
    const T0 = parseFloat(inputValues[`Displacement_T0_${d.id}`] || "0");

    console.log(λ, λ0, k, C, B, alpha, T, T0);

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
      <Table
        aria-label="Example static collection table"
        style={{ width: 400 }}
      >
        <TableHeader>
          {[...DISPLACEMENT_HEADER_CELL_NAMES].map((header: string) => (
            <TableColumn key={header}>{header}</TableColumn>
          ))}
        </TableHeader>
        <TableBody>
          {groupedData.map((d: GroupedItem) => (
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
                    handleInputChange(`Displacement_k_${d.id}`, e.target.value)
                  }
                />
              </TableCell>
              <TableCell>
                <Input
                  type="text"
                  value={inputValues[`Displacement_C_${d.id}`] || ""}
                  onChange={(e) =>
                    handleInputChange(`Displacement_C_${d.id}`, e.target.value)
                  }
                />
              </TableCell>
              <TableCell>
                <Input
                  type="text"
                  value={inputValues[`Displacement_B_${d.id}`] || ""}
                  onChange={(e) =>
                    handleInputChange(`Displacement_B_${d.id}`, e.target.value)
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
                    handleInputChange(`Displacement_T_${d.id}`, e.target.value)
                  }
                />
              </TableCell>
              <TableCell>
                <Input
                  type="text"
                  value={inputValues[`Displacement_T0_${d.id}`] || ""}
                  onChange={(e) =>
                    handleInputChange(`Displacement_T0_${d.id}`, e.target.value)
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
