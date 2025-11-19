import { LineChart, ReceivedData } from "../../../../shared";
import { prepareWavelengthChartData } from "./utils";

export const WavelengthChart = ({ data }: { data: ReceivedData[] }) => {
    const chartData = prepareWavelengthChartData(data);
    return (
        <LineChart data={chartData} />
    )
};