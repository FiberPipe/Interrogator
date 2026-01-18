export type SensorType = 'power' | 'wavelength' | 'temperature' | 'displacement';
export type ViewMode = 'chart' | 'table';

export interface ReceivedData {
  id: string;
  time: string;
  [key: string]: any;
}

export interface GroupedItem {
  id: number;
  rangeMin: number;
  rangeMax: number;
}

export interface GroupedWavelengthItem extends GroupedItem {
  wavelength: number;
}

export interface GroupedPowerItem extends GroupedItem {
  currentValue: number;
}

export interface TemperatureCoefficients {
  lambda0: number;
  E: number;
  D: number;
  C: number;
  B: number;
  A: number;
}

export interface DisplacementCoefficients {
  lambda0: number;
  k: number;
  C: number;
  B: number;
  alpha: number;
  T: number;
  T0: number;
}

export interface SensorTableColumn {
  key: string;
  label: string;
  isEditable?: boolean;
}
