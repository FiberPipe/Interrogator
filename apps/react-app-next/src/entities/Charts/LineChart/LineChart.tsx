import { useEffect, useRef, useState } from "react";
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Legend, Area, Line, Tooltip, Bar } from "recharts";
import block from 'bem-cn-lite';
import './LineChart.scss';
import { ConfidenceRange } from "./ConfidenceRange";
import type { ChartData, ChartType } from "@pages/Monitoring/ChartsPage/utils";

const b = block('universal-line-chart');


interface UniversalChartProps {
    data: ChartData[];
    unit: ChartType;
    confidenceInterval: number;
    autoScale: boolean;
}

export interface ChartDataWithConfidence extends Omit<ChartData, 'time'> {
    name: string;
    upperBound: number,
    lowerBound: number,
    confidenceRange: number[];
}

export const UniversalChart = ({ data, unit = 'Acquisition', confidenceInterval = 50, autoScale = true }: UniversalChartProps) => {
    const [yDomain, setYDomain] = useState(null);
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight
                });
            }
        };

        // Измеряем размер при монтировании
        updateDimensions();

        // Настраиваем слушатель изменения размера окна
        window.addEventListener('resize', updateDimensions);

        // Удаляем слушатель при размонтировании
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    useEffect(() => {
        if (autoScale && data && data.length > 0) {
            // Автоматическое определение домена по данным
            const values = data.map(item => item.value);
            const min = Math.min(...values) - confidenceInterval;
            const max = Math.max(...values) + confidenceInterval;
            const padding = (max - min) * 0.1; // 10% отступ

            setYDomain([min - padding, max + padding]);
        } else {
            // Сбросить к null для использования настроек recharts по умолчанию
            setYDomain(null);
        }
    }, [data, confidenceInterval, autoScale]);

    // // Форматирование времени для оси X
    const formatXAxis = (tickItem) => {
        const date = new Date(tickItem);
        return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    const dataWithConfidence: ChartDataWithConfidence[] = data.map(item => ({
        name: item.time,
        value: item.value,
        upperBound: item.value + confidenceInterval,
        lowerBound: item.value - confidenceInterval,
        confidenceRange: [item.value - confidenceInterval, item.value + confidenceInterval]
    }));

    console.log(dimensions)
    return (
        <div
            ref={containerRef}
            style={{
                width: dimensions.width,
                height: dimensions.height,
                maxWidth: '100%',
                position: 'relative'
            }}>
            <ResponsiveContainer width={"100%"} height={'100%'}>
                <ComposedChart
                    data={dataWithConfidence}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" label={{ value: 'Pages', position: 'insideBottomRight', offset: 0 }} />

                    <Tooltip
                        formatter={(value, name) => {
                            const labels = {
                                value: 'Значение',
                                upperBound: 'Верхняя граница',
                                lowerBound: 'Нижняя граница',
                                confidenceRange: 'Доверительный интервал'
                            };
                            return [`${typeof value === 'number' ? value.toFixed(2) : value} ${unit}`, labels[name] || name];
                        }}
                        labelFormatter={(label) => {
                            const date = new Date(label);
                            return `Время: ${date.toLocaleTimeString()}`;
                        }}
                    />
                    <Legend />

                    <Area
                        type="monotone"
                        dataKey="confidenceRange"
                        stroke="none"
                        fill="#8884d8"
                        fillOpacity={0.4}
                        name="Доверительный интервал"
                    />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#8884d8"
                        strokeWidth={2}
                        dot={true}
                        activeDot={{ r: 8 }}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};