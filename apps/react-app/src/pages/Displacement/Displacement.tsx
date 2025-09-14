import React, { useState, useEffect, useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Label,
    ReferenceLine,
    Brush
} from 'recharts';
import { processSensorData } from '../../features/buildDataForLineGraph/utils';
import { useInputStore } from '../../shared';
import { Button, Switch } from '@nextui-org/react'; // Предполагается, что вы используете NextUI

// Константы из Java класса
const LAMBDA_0 = 1550.0; // Эталонная длина волны (нм)
const L_MM = 100.0;      // Длина участка волокна (мм)

const extractIndex = (key: string) => {
    const match = key.match(/^wavelength(\d+)$/);
    return match ? parseInt(match[1], 10) : null;
};


// Цвета для линий
const lineColors = [
    "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
    "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"
];

// Функция для расчета смещения на основе длины волны (перенесена из Java)
const calculateDisplacement = (measuredLambda: number): number => {
    if (measuredLambda <= 0) return 0.0;
    const deltaLambda = measuredLambda - LAMBDA_0;
    return L_MM * deltaLambda / LAMBDA_0;
};

// Преобразование данных длины волны в смещение
const convertDataToDisplacement = (data: any[]) => {
    if (!data || data.length === 0) return [];

    return data.map(entry => {
        const newEntry: any = { name: entry.name };

        // Обрабатываем все числовые ключи (ID сенсоров)
        Object.keys(entry).forEach(key => {
            if (key === "name") return;

            // Если значение - число, преобразуем его в смещение
            if (typeof entry[key] === 'number') {
                newEntry[key] = calculateDisplacement(entry[key]);
            }
            // Если значение - строка, но может быть преобразовано в число
            else if (typeof entry[key] === 'string') {
                const numValue = parseFloat(entry[key]);
                if (!isNaN(numValue)) {
                    newEntry[key] = calculateDisplacement(numValue);
                } else {
                    // Сохраняем строковые значения без изменений
                    newEntry[key] = entry[key];
                }
            } else {
                // Сохраняем другие типы без изменений
                newEntry[key] = entry[key];
            }
        });

        return newEntry;
    });
};

const WavelengthDisplacementChart: React.FC = () => {
    const [transformedData, setTransformedData] = useState<any>({
        uniqueIds: [],
        resultData: [],
    });

    const [inputData, setInputData] = useState<{ [key: string]: string }>({});
    const { inputValues, filePaths } = useInputStore();
    const { sensorDataFilePath = "" } = filePaths ?? {};

    const [fetching, setFetching] = useState<boolean>(true);

    // Состояние для переключения между длиной волны и смещением
    const [showDisplacement, setShowDisplacement] = useState<boolean>(false);

    // Данные для отображения
    const [displayData, setDisplayData] = useState<any[]>([]);

    // Загрузка данных
    useEffect(() => {
        const fetchInputs = async () => {
            try {
                const sensorsData = await window.electron.getSensorsData(
                    sensorDataFilePath
                );
                const inputData = await window.electron.getInputs();

                const processedData = processSensorData(
                    sensorsData.filter((row) => row !== null)
                );

                setInputData(inputData);
                console.log('processedData', inputData, sensorsData)
                setTransformedData(processedData);
            } catch (error) {
                console.error("Error fetching input data:", error);
            }
        };

        if (fetching) {
            fetchInputs();
        }

        const intervalId = setInterval(() => {
            if (fetching) {
                fetchInputs();
            }
        }, 1000);

        return () => {
            clearInterval(intervalId);
        };
    }, [sensorDataFilePath, fetching]);

    // Обработка и преобразование данных
    useEffect(() => {
        if (transformedData.resultData && transformedData.resultData.length > 0) {
            console.log('transformed data', transformedData)
            if (showDisplacement) {
                // Преобразуем данные длины волны в смещение
                const displacementData = convertDataToDisplacement(transformedData.resultData);
                setDisplayData(displacementData);
            } else {
                // Отображаем исходные данные длины волны
                setDisplayData(transformedData.resultData);
            }
        }
    }, [transformedData, showDisplacement]);

    const toggleFetching = () => {
        setFetching((prev) => !prev);
    };

    const toggleDisplayMode = () => {
        setShowDisplacement(prev => !prev);
    };

    // Настройка для tooltips
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    backgroundColor: 'white',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Время: {label}</p>
                    {payload.map((item: any, index: number) => (
                        <p key={index} style={{ color: item.color, margin: '2px 0' }}>
                            <span style={{ fontWeight: 'bold' }}>{item.name || item.dataKey}: </span>
                            <span>{typeof item.value === 'number' ? item.value.toFixed(4) : item.value}</span>
                            <span>{showDisplacement ? ' мм' : ' нм'}</span>
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Получение цвета для линии
    const getLineColor = (index: number) => lineColors[index % lineColors.length];

    console.log('displayData', transformedData, inputValues);

    return (
        <div style={{ width: '100%', height: '100%', padding: '15px' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px'
            }}>
                <Button color="primary" onClick={toggleFetching}>
                    {fetching ? "Stop" : "Start"}
                </Button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: showDisplacement ? 'normal' : 'bold' }}>
                        Длина волны (нм)
                    </span>
                    <Switch
                        checked={showDisplacement}
                        onChange={toggleDisplayMode}
                        size="lg"
                    />
                    <span style={{ fontWeight: showDisplacement ? 'bold' : 'normal' }}>
                        Смещение (мм)
                    </span>
                </div>
            </div>

            {/* Информация о параметрах */}
            <div style={{
                display: 'flex',
                gap: '20px',
                marginBottom: '15px',
                padding: '10px',
                background: showDisplacement ? '#f0f8ff' : 'transparent',
                borderRadius: '4px',
                border: showDisplacement ? '1px solid #d0e8ff' : 'none'
            }}>
                <div><strong>Эталонная длина волны:</strong> {LAMBDA_0} нм</div>
                <div><strong>Длина волокна:</strong> {L_MM} мм</div>
                {showDisplacement && (
                    <div><strong>Формула:</strong> Смещение = L × (λ - λ₀) / λ₀</div>
                )}
            </div>

            {/* График */}
            {displayData.length > 0 ? (
                <ResponsiveContainer width="100%" height={500}>
                    <LineChart
                        data={displayData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 12 }}
                            height={50}
                            angle={-30}
                            textAnchor="end"
                            label={{
                                value: 'Время',
                                position: 'insideBottom',
                                offset: -10,
                                style: { fontWeight: 'bold' }
                            }}
                        />
                        <YAxis
                            label={{
                                value: showDisplacement ? 'Смещение (мм)' : 'Длина волны (нм)',
                                angle: -90,
                                position: 'insideLeft',
                                style: { textAnchor: 'middle', fontWeight: 'bold' }
                            }}
                            tick={{ fontSize: 12 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        <Brush dataKey="name" height={30} stroke="#8884d8" />
                        {transformedData.uniqueIds
                            .filter((key: string) => {
                                const index = extractIndex(key);
                                if (index === null) return false;
                                return inputValues?.sensorTypes?.[index] === "displacement";
                            })
                            .map((id: string, index: number) => (
                                <Line
                                    key={`line-${id}`}
                                    type="monotone"
                                    dataKey={String(id)}
                                    name={`Датчик ${id}`}
                                    stroke={getLineColor(index)}
                                    strokeWidth={3}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 8 }}
                                    isAnimationActive={false}
                                    connectNulls
                                />
                            ))}

                        {/* Референсная линия (эталонная длина волны или нулевое смещение) */}
                        {!showDisplacement ? (
                            <ReferenceLine
                                y={LAMBDA_0}
                                stroke="red"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                label={{
                                    value: `λ₀ = ${LAMBDA_0} нм`,
                                    position: 'right',
                                    fill: 'red',
                                    fontWeight: 'bold'
                                }}
                            />
                        ) : (
                            <ReferenceLine
                                y={0}
                                stroke="green"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                label={{
                                    value: 'Нулевое смещение',
                                    position: 'right',
                                    fill: 'green',
                                    fontWeight: 'bold'
                                }}
                            />
                        )}
                    </LineChart>
                </ResponsiveContainer>
            ) : (
                <div style={{
                    height: 500,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    border: '1px solid #eee',
                    borderRadius: '8px'
                }}>
                    <p>Нет данных для отображения</p>
                </div>
            )}

            {/* Информация внизу */}
            <div style={{
                marginTop: '15px',
                padding: '10px',
                backgroundColor: '#f5f5f5',
                borderRadius: '5px',
                fontSize: '14px'
            }}>
                <p><strong>Формула расчета:</strong> Смещение = L × (λ - λ₀) / λ₀</p>
                <p>где L - длина волокна, λ - измеренная длина волны, λ₀ - эталонная длина волны</p>
                <p><strong>Как использовать:</strong> Переключатель позволяет отображать исходные данные длины волны или рассчитанное смещение.</p>
            </div>
        </div>
    );
};

export default WavelengthDisplacementChart;
