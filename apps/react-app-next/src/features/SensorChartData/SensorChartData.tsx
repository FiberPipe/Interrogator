import { UniversalChart } from "@entities/Charts"
import { useGetSensorChartData } from "./useGetSensorChartData"
import { ChartType } from "@shared/types/charts";
import { useInputStore } from "@shared/store";

interface SensorChartDataProps {
    type: ChartType;
}

export const SensorChartData = ({ type }: SensorChartDataProps) => {
    const { filePaths } = useInputStore();
    const { sensorDataFilePath = "" } = filePaths ?? {};
    const { data } = useGetSensorChartData({ type, sensorDataFilePath });
    
    return (
        <UniversalChart data={[]} unit={"Acquisition"} confidenceInterval={0} autoScale={false} />
    )
}