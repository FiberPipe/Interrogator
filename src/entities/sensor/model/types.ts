export type SensorType = 'displacement' | 'temperature' | 'pressure' | 'strain' | 'vibration' | '';

export interface SensorConfig {
  index: number;
  type: SensorType;
  channels: string[];
  alias?: string; // 👈 Добавляем псевдоним
}

export const MAX_CHANNELS_PER_SENSOR = 4; // 👈 Ограничение

export const createEmptySensor = (index: number): SensorConfig => ({
  index,
  type: '',
  channels: [],
  alias: '', // 👈 Пустой псевдоним по умолчанию
});
