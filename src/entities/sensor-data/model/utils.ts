import type { ReceivedData, GroupedWavelengthItem, GroupedPowerItem } from './types';

/**
 * Группирует данные по ID канала wavelength
 * Возвращает массив с информацией по каждому каналу
 */
export const groupDataByWavelengthId = (data: ReceivedData[]): GroupedWavelengthItem[] => {
    if (!data.length) return [];

    const groupedData: Record<number, number[]> = {};

    // Собираем все значения для каждого канала
    data.forEach((item) => {
        Object.keys(item).forEach((key) => {
            const idMatch = key.match(/^wavelength(\d+)$/);
            if (!idMatch) return;

            const sensorId = Number(idMatch[1]);
            const value = Number(item[key]);
            if (isNaN(value)) return;

            if (!groupedData[sensorId]) groupedData[sensorId] = [];
            groupedData[sensorId].push(value);
        });
    });

    // Формируем результат
    return Object.keys(groupedData)
        .map((key) => {
            const id = Number(key);
            const values = groupedData[id];

            return {
                id,
                wavelength: values[values.length - 1], // Последнее значение
                values, // История всех значений
                rangeMin: values.length ? Math.min(...values) : 0,
                rangeMax: values.length ? Math.max(...values) : 0,
            };
        })
        .sort((a, b) => a.id - b.id);
};

/**
 * Группирует данные по ID канала Power
 * Возвращает массив с информацией по каждому каналу
 */
export const groupDataByPowerId = (data: ReceivedData[]): GroupedPowerItem[] => {
    if (!data.length) return [];

    const groupedData: Record<number, number[]> = {};

    // Собираем все значения для каждого канала
    data.forEach((item) => {
        Object.keys(item).forEach((key) => {
            const idMatch = key.match(/^P(\d+)$/);
            if (!idMatch) return;

            const sensorId = Number(idMatch[1]);
            const value = Number(item[key]);
            if (isNaN(value)) return;

            if (!groupedData[sensorId]) groupedData[sensorId] = [];
            groupedData[sensorId].push(value);
        });
    });

    // Формируем результат
    return Object.keys(groupedData)
        .map((key) => {
            const id = Number(key);
            const values = groupedData[id];

            return {
                id,
                currentValue: values[values.length - 1], // Последнее значение
                values, // История всех значений для спарклайна
                rangeMin: values.length ? Math.min(...values) : 0,
                rangeMax: values.length ? Math.max(...values) : 0,
            };
        })
        .sort((a, b) => a.id - b.id);
};
