import { ResponsiveLine } from "@nivo/line";
import type { Serie } from "@nivo/core";
import { useMemo } from "react";

interface LineChartProps {
    data: { id: string; data: { x: string; y: number }[] }[];
    yScale?: any;
    confidenceIntervalLayer?: number;
}

const ConfidenceInterval = ({ series, xScale, yScale }: any) => {
    if (!series) return null;

    return (
        <g>
            {series.map((s: any) => {
                if (!s.upper || !s.lower) return null;

                const upperPath = s.upper.map((d: any) => `${xScale(d.x)},${yScale(d.y)}`);
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

export const LineChart = ({
    data,
    yScale,
    confidenceIntervalLayer = 0,
}: LineChartProps) => {
    const withIntervals: (Serie & { upper: any[]; lower: any[] })[] = useMemo(() => {
        const interval = confidenceIntervalLayer || 0;

        return data.map((serie) => {
            const upper = serie.data.map((d) => ({ x: d.x, y: d.y + interval }));
            const lower = serie.data.map((d) => ({ x: d.x, y: d.y - interval }));
            return { ...serie, upper, lower };
        });
    }, [data, confidenceIntervalLayer]);

    const showLegend = data.length <= 18;

    return (
        <div style={{ height: "100%", width: "100%" }}>
            <ResponsiveLine
                data={withIntervals}
                margin={{ top: 16, right: 16, bottom: 48, left: 56 }}
                xScale={{ type: "point" }}
                yScale={yScale ?? { type: "linear", min: "auto", max: "auto" }}
                axisBottom={{
                    tickRotation: -30,
                    legend: "Время",
                    legendOffset: 40,
                    legendPosition: "middle",
                }}
                axisLeft={{
                    legend: "Значение",
                    legendOffset: -48,
                    legendPosition: "middle",
                }}
                curve="monotoneX"
                enablePoints={false}
                lineWidth={2}
                useMesh
                enableSlices="x"
                sliceTooltip={({ slice }) => (
                    <div
                        style={{
                            background: "rgba(255,255,255,.9)",
                            padding: "6px 8px",
                            border: "1px solid #e5e7eb",
                            borderRadius: 6,
                            fontSize: 12,
                        }}
                    >
                        <div style={{ marginBottom: 4, color: "#6b7280" }}>
                            {slice.points?.[0]?.data?.xFormatted ?? ""}
                        </div>
                        {slice.points.map((p) => (
                            <div key={p.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                <span
                                    style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: 999,
                                        background: p.serieColor,
                                        display: "inline-block",
                                    }}
                                />
                                <span>{p.serieId}:</span>
                                <strong>{p.data.yFormatted}</strong>
                            </div>
                        ))}
                    </div>
                )}
                colors={{ scheme: "category10" }}
                gridXValues={5}
                gridYValues={6}
                theme={{
                    grid: { line: { stroke: "#e5e7eb", strokeDasharray: "3 3" } },
                    axis: {
                        ticks: { text: { fill: "#4b5563", fontSize: 11 } },
                        legend: { text: { fill: "#374151", fontSize: 12, fontWeight: 500 } },
                    },
                    crosshair: { line: { stroke: "#9ca3af", strokeWidth: 1, strokeOpacity: 0.8 } },
                    legends: { text: { fontSize: 12, fill: "#374151" } },
                }}
                legends={
                    showLegend
                        ? [
                            {
                                anchor: "bottom-right",
                                direction: "column",
                                translateX: 0,
                                translateY: 0,
                                itemWidth: 80,
                                itemHeight: 18,
                                itemsSpacing: 2,
                                symbolSize: 10,
                                symbolShape: "circle",
                            },
                        ]
                        : []
                }
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
