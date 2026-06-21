import type { TemperatureCoefficients } from './types';

/**
 * Вычисление температуры по формуле полинома 4-й степени
 * T = E(λ - λ₀)⁴ + D(λ - λ₀)³ + C(λ - λ₀)² + B(λ - λ₀) + A
 */
export const calculateTemperature = (
  wavelength: number,
  coeffs: TemperatureCoefficients,
): number => {
  const delta = wavelength - coeffs.lambda0;

  const result =
    coeffs.E * Math.pow(delta, 4) +
    coeffs.D * Math.pow(delta, 3) +
    coeffs.C * Math.pow(delta, 2) +
    coeffs.B * delta +
    coeffs.A;

  return result;
};

/**
 * Валидация коэффициентов
 */
export const validateCoefficients = (coeffs: TemperatureCoefficients): boolean => {
  return Object.values(coeffs).every((val) => typeof val === 'number' && isFinite(val));
};
