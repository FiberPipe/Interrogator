// hooks/useTemperatureCalculator.ts
import { useInputStore } from "@shared/store";

export const useTemperatureCalculator = () => {
  const { inputValues, updateInputValue } = useInputStore();

  const calculateTemperature = (λ: number, id: string) => {
    const λ0 = parseFloat(inputValues[`Temp_λ₀_${id}`] || "0");
    const E = parseFloat(inputValues[`Temp_E_${id}`] || "0");
    const D = parseFloat(inputValues[`Temp_D_${id}`] || "0");
    const C = parseFloat(inputValues[`Temp_C_${id}`] || "0");
    const B = parseFloat(inputValues[`Temp_B_${id}`] || "0");
    const A = parseFloat(inputValues[`Temp_A_${id}`] || "0");

    return (
      E * Math.pow(λ - λ0, 4) +
      D * Math.pow(λ - λ0, 3) +
      C * Math.pow(λ - λ0, 2) +
      B * (λ - λ0) +
      A
    );
  };

  const handleInputChange = async (key: string, value: string) => {
    updateInputValue(key, value);
    // await window.electron.insertInput(key, value);
  };

  return { calculateTemperature, handleInputChange, inputValues };
};
