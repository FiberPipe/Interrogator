import type { TemperatureCoefficients, DisplacementCoefficients } from './types';

/**
 * Расчет температуры по формуле:
 * T = E(λ - λ₀)⁴ + D(λ - λ₀)³ + C(λ - λ₀)² + B(λ - λ₀) + A
 */
export const calculateTemperature = (
  wavelength: number,
  coeffs: TemperatureCoefficients,
): number => {
  if (!isFinite(wavelength) || isNaN(wavelength)) return NaN;

  const delta = wavelength - coeffs.lambda0;

  return (
    coeffs.E * Math.pow(delta, 4) +
    coeffs.D * Math.pow(delta, 3) +
    coeffs.C * Math.pow(delta, 2) +
    coeffs.B * delta +
    coeffs.A
  );
};

/**
 * Расчет смещения по формуле:
 * ε = (10⁶ · (λ - λ₀)) / (k · λ₀) - C(T² - T₀²) - (B + α)(T - T₀)
 */
export const calculateDisplacement = (
  wavelength: number,
  coeffs: DisplacementCoefficients,
): number => {
  if (!isFinite(wavelength) || isNaN(wavelength)) return NaN;

  return (
    (Math.pow(10, 6) * (wavelength - coeffs.lambda0)) / (coeffs.k * coeffs.lambda0) -
    coeffs.C * (Math.pow(coeffs.T, 2) - Math.pow(coeffs.T0, 2)) -
    (coeffs.B + coeffs.alpha) * (coeffs.T - coeffs.T0)
  );
};

/**
 * Расчет деформации (strain) - упрощенная формула
 */
export const calculateStrain = (wavelength: number, lambda0: number, k: number): number => {
  if (!isFinite(wavelength) || isNaN(wavelength)) return NaN;

  return ((wavelength - lambda0) / lambda0) * (1 / k);
};

/**
 * Расчет давления (если используется специальный датчик)
 */
export const calculatePressure = (
  wavelength: number,
  coeffs: { lambda0: number; sensitivity: number; offset: number },
): number => {
  if (!isFinite(wavelength) || isNaN(wavelength)) return NaN;

  const delta = wavelength - coeffs.lambda0;
  return delta * coeffs.sensitivity + coeffs.offset;
};
