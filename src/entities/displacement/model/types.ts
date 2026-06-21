export interface DisplacementCoefficients {
  lambda0: number; // Эталонная длина волны (нм)
  k: number; // Калибровочный коэффициент датчика
  C: number; // Коэффициент температурной компенсации (квадратичный)
  B: number; // Коэффициент температурной компенсации (линейный)
  alpha: number; // Коэффициент теплового расширения
  T: number; // Текущая температура (°C)
  T0: number; // Эталонная температура (°C)
}

export interface DisplacementSensor {
  id: number;
  coefficients: DisplacementCoefficients;
  currentDisplacement: number;
}
