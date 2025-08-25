// BarChart.tsx
import { ResponsiveBar } from "@nivo/bar";

interface BarChartProps {
    data: { id: string; data: { x: string; y: number }[] }[];
}

export const BarChart = ({ data }: BarChartProps) => {
    // преобразуем ChartSerie[] -> формат для Nivo
    const barData = data.map((serie, idx) => ({
        index: serie.id,   // подпись столбца (Ratio-0/1 и т.п.)
        ratio: serie.data[0]?.y ?? 0, // берём y (у нас только одна точка)
    }));

    return (
        <ResponsiveBar
            data={barData}
            keys={["ratio"]}
            indexBy="index"
            margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
            padding={0.3}
            valueScale={{ type: "linear" }}
            indexScale={{ type: "band", round: true }}
            axisBottom={{
                legend: "Ratio (Ch[i]/Ch[i+1])",
                legendPosition: "middle",
                legendOffset: 40,
            }}
            axisLeft={{
                legend: "Value",
                legendPosition: "middle",
                legendOffset: -50,
            }}
            enableGridX={false}
            enableGridY={true}
            colors={{ scheme: "nivo" }}
            borderRadius={4}
        />
    );
};
