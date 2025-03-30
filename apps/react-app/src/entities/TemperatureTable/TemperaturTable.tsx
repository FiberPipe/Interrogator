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
import { FBG_HEADER_CELL_NAMES, groupDataById, GroupedItem } from "./utils";
import { Fragment, useEffect } from "react";

type Props = {
  body: TData[];
};
export const TemperatureTable: React.FC<Props> = ({ body }) => {
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

  console.log("Current data temperature:", body); // Добавим отладочный вывод
  console.log("Current input values:", inputValues); // Добавим отладочный вывод

  const calculateTemperature = (d: GroupedItem) => {
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
          {[...FBG_HEADER_CELL_NAMES].map((header: string) => (
            <TableColumn key={header}>{header}</TableColumn>
          ))}
        </TableHeader>
        <TableBody>
          {groupedData.map((d: GroupedItem) => (
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
