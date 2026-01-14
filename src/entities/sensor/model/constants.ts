import type { SensorType } from './types';

export const SENSOR_TYPES: Array<{ value: SensorType; labelKey: string }> = [
  { value: 'displacement', labelKey: 'sensors.types.displacement' },
  { value: 'temperature', labelKey: 'sensors.types.temperature' },
  { value: 'pressure', labelKey: 'sensors.types.pressure' },
  { value: 'strain', labelKey: 'sensors.types.strain' },
  { value: 'vibration', labelKey: 'sensors.types.vibration' },
  { value: '', labelKey: 'sensors.types.none' },
];

export const AVAILABLE_CHANNELS = Array.from({ length: 16 }, (_, i) => `P${i}`);

export const MIN_SENSORS = 1;
export const MAX_SENSORS = 8;

export const SENSOR_TYPE_COLORS: Record<SensorType, string> = {
  displacement: '#3b82f6',
  temperature: '#ef4444',
  pressure: '#10b981',
  strain: '#f59e0b',
  vibration: '#8b5cf6',
  '': '#6b7280',
};

export const SENSOR_TYPE_ICONS: Record<SensorType, string> = {
  displacement: '📏',
  temperature: '🌡️',
  pressure: '🔘',
  '': '❓',
};
