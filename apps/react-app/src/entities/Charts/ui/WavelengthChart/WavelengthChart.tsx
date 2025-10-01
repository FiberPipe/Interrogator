import { ChartWrapper, LineChart, ReceivedData } from "../../../../shared";
import { prepareWavelengthChartData } from "./utils";

export const WavelengthChart = ({ data }: { data: ReceivedData[] }) => {
    const chartData = prepareWavelengthChartData(data);
    return (
        <div className="w-full h-[70vh]">
            <ChartWrapper>
                <LineChart data={chartData} />
            </ChartWrapper>
        </div>
    )
};