import { ChartWrapper, LineChart, ReceivedData } from "../../../../shared";
import { preparePowerChartData } from "./utils";

export const PowerChart = ({ data }: { data: ReceivedData[] }) => {
    const chartData = preparePowerChartData(data);
    return (
        <div className="w-full h-[70vh]">
            <ChartWrapper>
                <LineChart data={chartData} />
            </ChartWrapper>
        </div>
    )
};