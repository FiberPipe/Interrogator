import { ChartWrapper, LineChart, ReceivedData } from "../../../../shared";
import { preparePowerChartData } from "./utils";

export const PowerChart = ({ data }: { data: ReceivedData[] }) => {
    const chartData = preparePowerChartData(data);
    return (
        <LineChart data={chartData} />
    )
};