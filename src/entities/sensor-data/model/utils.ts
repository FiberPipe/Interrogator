import type { ReceivedData, GroupedWavelengthItem, GroupedPowerItem } from './types';

export const groupDataByWavelengthId = (data: ReceivedData[]): GroupedWavelengthItem[] => {
  const groupedData: Record<number, number[]> = {};

  data.forEach((item) => {
    Object.keys(item).forEach((key) => {
      const idMatch = key.match(/^wavelength(\d+)$/);
      if (!idMatch) return;

      const sensorId = Number(idMatch[1]);
      const value = Number(item[key]);
      if (isNaN(value)) return;

      if (!groupedData[sensorId]) groupedData[sensorId] = [];
      groupedData[sensorId].push(value);
    });
  });

  return Object.keys(groupedData).map((key) => {
    const id = Number(key);
    const values = groupedData[id];
    return {
      id,
      wavelength: values[values.length - 1],
      rangeMin: values.length ? Math.min(...values) : NaN,
      rangeMax: values.length ? Math.max(...values) : NaN,
    };
  });
};

export const groupDataByPowerId = (data: ReceivedData[]): GroupedPowerItem[] => {
  const groupedData: Record<number, number[]> = {};

  data.forEach((item) => {
    Object.keys(item).forEach((key) => {
      const idMatch = key.match(/^P(\d+)$/);
      if (!idMatch) return;

      const sensorId = Number(idMatch[1]);
      const value = Number(item[key]);
      if (isNaN(value)) return;

      if (!groupedData[sensorId]) groupedData[sensorId] = [];
      groupedData[sensorId].push(value);
    });
  });

  return Object.keys(groupedData).map((key) => {
    const id = Number(key);
    const values = groupedData[id];
    return {
      id,
      currentValue: values[values.length - 1],
      rangeMin: values.length ? Math.min(...values) : NaN,
      rangeMax: values.length ? Math.max(...values) : NaN,
    };
  });
};

export const calculateTemperature = (
  wavelength: number,
  coeffs: { lambda0: number; E: number; D: number; C: number; B: number; A: number }
): number => {
  const delta = wavelength - coeffs.lambda0;
  return (
    coeffs.E * Math.pow(delta, 4) +
    coeffs.D * Math.pow(delta, 3) +
    coeffs.C * Math.pow(delta, 2) +
    coeffs.B * delta +
    coeffs.A
  );
};

export const calculateDisplacement = (
  wavelength: number,
  coeffs: { lambda0: number; k: number; C: number; B: number; alpha: number; T: number; T0: number }
): number => {
  return (
    (Math.pow(10, 6) * (wavelength - coeffs.lambda0)) / (coeffs.k * coeffs.lambda0) -
    coeffs.C * (Math.pow(coeffs.T, 2) - Math.pow(coeffs.T0, 2)) -
    (coeffs.B + coeffs.alpha) * (coeffs.T - coeffs.T0)
  );
};
