export type SensorType = 'displacement' | 'temperature' | 'pressure' | 'strain' | 'vibration' | '';

export interface SensorConfig {
  index: number;
  type: SensorType;
  channels: string[];
  name?: string;
}

export interface SensorConfiguration {
  sensorCount: number;
  sensors: Record<number, SensorConfig>;
}

export const isValidSensorConfig = (sensor: any): sensor is SensorConfig => {
  return (
    sensor &&
    typeof sensor === 'object' &&
    typeof sensor.index === 'number' &&
    typeof sensor.type === 'string' &&
    Array.isArray(sensor.channels)
  );
};

export const createEmptySensor = (index: number): SensorConfig => ({
  index,
  type: '',
  channels: [],
});
