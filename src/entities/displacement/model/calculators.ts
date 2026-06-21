import type { DisplacementCoefficients } from './types';

/**
 * Вычисление деформации по формуле:
 * ε = (10⁶ · (λ - λ₀)) / (k · λ₀) - C(T² - T₀²) - (B + α)(T - T₀)
 */
export const calculateDisplacement = (
  wavelength: number,
  coeffs: DisplacementCoefficients,
): number => {
  const { lambda0, k, C, B, alpha, T, T0 } = coeffs;

  // Проверка на деление на ноль
  if (lambda0 === 0 || k === 0) {
    return 0;
  }

  // Основная часть: деформация от изменения длины волны
  const strainFromWavelength = (1e6 * (wavelength - lambda0)) / (k * lambda0);

  // Температурная компенсация (квадратичная)
  const temperatureCompensationQuadratic = C * (T * T - T0 * T0);

  // Температурная компенсация (линейная)
  const temperatureCompensationLinear = (B + alpha) * (T - T0);

  const displacement =
    strainFromWavelength - temperatureCompensationQuadratic - temperatureCompensationLinear;

  return displacement;
};

/**
 * Валидация коэффициентов
 */
export const validateDisplacementCoefficients = (coeffs: DisplacementCoefficients): boolean => {
  return Object.values(coeffs).every((val) => typeof val === 'number' && isFinite(val));
};
