export interface PowerDataPoint {
  id: string;
  time: string;
  [key: string]: any;
}

export interface GroupedPowerItem {
  id: number;
  currentValue: number;
  rangeMin: number;
  rangeMax: number;
  values: number[];
  alarmMin?: number;
  alarmMax?: number;
}

export interface AlarmThresholds {
  [key: string]: {
    min?: number;
    max?: number;
  };
}
