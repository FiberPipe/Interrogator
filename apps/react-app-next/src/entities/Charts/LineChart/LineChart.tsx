import { ResponsiveLine } from "@nivo/line";
import type { Serie } from "@nivo/core";
import { useMemo } from "react";

interface LineChartProps {
    data: { id: string; data: { x: string; y: number }[] }[];
}

// Кастомный слой для отрисовки доверительных интервалов
const ConfidenceInterval = ({ series, xScale, yScale }: any) => {
    return (
        <g>
            {series.map((s: any) => {
                if (!s.upper || !s.lower) return null;

                const upperPath = s.upper.map(
                    (d: any) => `${xScale(d.x)},${yScale(d.y)}`
                );
                const lowerPath = s.lower
                    .slice()
                    .reverse()
                    .map((d: any) => `${xScale(d.x)},${yScale(d.y)}`);

                const path = `M ${upperPath.join(" L ")} L ${lowerPath.join(" L ")} Z`;

                return (
                    <path
                        key={s.id + "_interval"}
                        d={path}
                        fill={s.color}
                        fillOpacity={0.15}
                        stroke="none"
                    />
                );
            })}
        </g>
    );
};

export const LineChart = ({ data }: LineChartProps) => {
    const withIntervals: (Serie & { upper: any[]; lower: any[] })[] = useMemo(() => {
        const interval = 0.001;

        return data.map((serie) => {
            const upper = serie.data.map((d) => ({ x: d.x, y: d.y + interval }));
            const lower = serie.data.map((d) => ({ x: d.x, y: d.y - interval }));

            return { ...serie, upper, lower };
        });
    }, [data]);

    return (
        <div style={{ height: "100%", width: "100%" }}>
            <ResponsiveLine
                data={withIntervals}
                margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                xScale={{ type: "point" }}
                yScale={{ type: "linear", min: "auto", max: "auto" }}
                axisBottom={{
                    tickRotation: -30,
                    legend: "Время",
                    legendOffset: 40,
                    legendPosition: "middle",
                }}
                axisLeft={{
                    legend: "Значение",
                    legendOffset: -50,
                    legendPosition: "middle",
                }}
                curve="monotoneX"
                enablePoints={false}
                lineWidth={2}
                useMesh={true}
                colors={{ scheme: "category10" }}
                legends={[
                    {
                        anchor: "bottom-right",
                        direction: "column",
                        translateX: 100,
                        itemWidth: 80,
                        itemHeight: 20,
                        symbolSize: 12,
                        symbolShape: "circle",
                        data: data.map((d) => ({ id: d.id, label: d.id })),
                    },
                ]}
                layers={[
                    "grid",
                    "markers",
                    "axes",
                    ConfidenceInterval,
                    "lines",
                    "points",
                    "slices",
                    "mesh",
                    "legends",
                ]}
            />
        </div>
    );
};
