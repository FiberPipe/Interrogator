export type CalibrationMethod = 'table' | 'csv' | 'json' | 'code';

export interface CalibrationData {
  normalization: Record<string, number>; // field0-15
  wavelengths: Record<string, number>; // lambdas_central0-15
  sensorDataFilePath?: string;
}

export interface CalibrationField {
  index: number;
  normalization: string;
  wavelength: string;
}

export const CHANNEL_COUNT = 16;

export const createEmptyCalibrationData = (): CalibrationData => ({
  normalization: Object.fromEntries(
    Array.from({ length: CHANNEL_COUNT }, (_, i) => [`field${i}`, 0])
  ),
  wavelengths: Object.fromEntries(
    Array.from({ length: CHANNEL_COUNT }, (_, i) => [`lambdas_central${i}`, 0])
  ),
});
