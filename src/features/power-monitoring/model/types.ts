export interface GroupedItem {
  id: number;
  values: number[]; // 👈 История значений
  rangeMin: number;
  rangeMax: number;
}

export interface GroupedWavelengthItem extends GroupedItem {
  wavelength: number; // Текущее значение
}

export interface GroupedPowerItem extends GroupedItem {
  currentValue: number; // Текущее значение
}

export interface AlarmThresholds {
  [key: string]: {
    min?: number;
    max?: number;
  };
}
