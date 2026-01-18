type SensorRecord = {
  id_record: number;
  time: string;
  [key: string]: number | string;
};

export const generateMockData = (
  points = 60,
  channels = 16
): SensorRecord[] => {
  const data: SensorRecord[] = [];

  const baseValues = Array.from({ length: channels }, (_, i) => 2 + Math.sin(i));

  for (let i = 0; i < points; i++) {
    const record: SensorRecord = {
      id_record: i + 1,
      time: `00:${String(Math.floor(i / 60)).padStart(2, '0')}:${String(
        i % 60
      ).padStart(2, '0')}.${String((i * 37) % 1000).padStart(3, '0')}`,
    };

    for (let ch = 0; ch < channels; ch++) {
      const noise = (Math.random() - 0.5) * 0.08;
      const drift = Math.sin(i / 10) * 0.03;

      record[`P${ch}`] = Number(
        (baseValues[ch] + noise + drift).toFixed(6)
      );
      record[`stdDev${ch}`] = Number(
        (0.012 + Math.random() * 0.008).toFixed(6)
      );
    }

    data.push(record);
  }

  return data;
};


export const mockSensorData = generateMockData(120, 16);
