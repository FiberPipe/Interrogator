import { ResponsiveBar } from "@nivo/bar";

interface BarChartProps {
    data: { id: string; data: { x: string; y: number }[] }[];
    yScale?: any;
    xScale?: any
}

export const BarChart = ({ data, yScale }: BarChartProps) => {
    const barData = data.map((serie) => ({
        index: serie.id,
        ratio: serie.data[0]?.y ?? 0,
    }));

    return (
        <ResponsiveBar
            data={barData}
            keys={["ratio"]}
            indexBy="index"
            margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
            padding={0.3}
            valueScale={yScale ?? { type: "linear" }}
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
