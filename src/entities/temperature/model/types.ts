export interface TemperatureCoefficients {
  lambda0: number;
  E: number;
  D: number;
  C: number;
  B: number;
  A: number;
}

export interface TemperatureSensor {
  id: number;
  coefficients: TemperatureCoefficients;
  currentTemperature: number;
}
