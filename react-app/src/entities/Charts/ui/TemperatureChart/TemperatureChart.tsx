import { ChartWrapper, LineChart, ReceivedData } from "../../../../shared";
import { prepareTemperatureChartData } from "./utils";

export const PowerChart = ({ data }: { data: ReceivedData[] }) => {
    const chartData = prepareTemperatureChartData(data);
    return (
        <div className="w-full h-[70vh]">
            <ChartWrapper>
                <LineChart data={chartData} />
            </ChartWrapper>
        </div>
    )
};