export const processSensorData = (data: TData[]): ProcessedData => {
  const timeDict: Record<
    string,
    Partial<Record<number, Record<string, number>>>
  > = {};
  const lastValues: Partial<
    Record<number, Record<string, Record<string, number>>>
  > = {};

  const uniqueIdsSet = new Set<number>(); // Для уникальных id_sensor
  const uniquePXKeys = new Set<string>(); // Для уникальных ключей PX

  data.forEach((record) => {
    const time = record.time;
    const id = record.id_sensor;

    // Собираем все P-поля и stdDev-поля с их значениями
    const sensorData: Record<string, number> = {
      wavelength: record.wavelength,
    };
    Object.keys(record).forEach((key) => {
      if (key.startsWith("P") && key !== "wavelength") {
        sensorData[key] = record[key as keyof typeof record] as number;
        uniquePXKeys.add(key); // Добавляем ключ PX в Set
      } else if (key.startsWith("stdDev") && key !== "wavelength") {
        sensorData[key] = record[key as keyof typeof record] as number;
      }
    });

    uniqueIdsSet.add(id); // Добавляем id_sensor в Set

    if (!timeDict[time]) timeDict[time] = {};
    timeDict[time][id] = sensorData;

    if (!lastValues[id]) lastValues[id] = {};
    lastValues[id]![time] = sensorData;
  });

  const times = Object.keys(timeDict).sort();

  const resultData: OutputRecord[] = times.map((time) => {
    const entry: OutputRecord = { name: time };

    for (const id in lastValues) {
      const sensorId = +id;
      const sensorEntries = lastValues[sensorId];
      if (!sensorEntries) continue;

      const sensorTimes = Object.keys(sensorEntries)
        .filter((t) => t <= time)
        .sort();
      const lastTime =
        sensorTimes.length > 0 ? sensorTimes[sensorTimes.length - 1] : null;

      if (lastTime) {
        const sensorData = sensorEntries[lastTime];
        // Добавляем все P-поля и stdDev-поля в entry
        Object.entries(sensorData).forEach(([key, value]) => {
          if (key.startsWith("P") || key.startsWith("stdDev")) {
            // Формируем уникальный ключ: PX или stdDevX
            const uniqueKey = `${key}`;
            entry[uniqueKey] = value;
          }
        });
      }
    }

    return entry;
  });

  const filteredResultData = resultData.filter(
    (entry) => Object.keys(entry).length > 1
  );
  const uniquePX = Array.from(uniquePXKeys).sort(); // Уникальные ключи PX

  console.log(171717, { uniqueIds: uniquePX, resultData: filteredResultData });

  return { uniqueIds: uniquePX, resultData: filteredResultData };
};
