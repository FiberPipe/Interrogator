import { PowerChart, WavelengthChart } from "../../../entities";
import  { DisplacementChart } from "../../../entities/Charts/ui/DisplacementChart/DisplacementChart";
import { SensorMetric } from "../../../shared";
import { usePollingData } from "../../hooks/usePollingData";

interface DataTableProps {
    sensorType: SensorMetric;
}

export const DataCharts = ({ sensorType }: DataTableProps) => {
    const { data } = usePollingData();

    return (
        <div className="w-full h-full">
            {sensorType === "Wavelength" ? <WavelengthChart data={data} /> : null}
            {sensorType === "Displacement" && (
                <div className="flex items-center justify-center h-full">
                    DispacementChart
                </div>
            )}
            {sensorType === "Power" ? <PowerChart data={data} /> : null}
            {sensorType === "Displacement" ? <DisplacementChart data={data} /> : null}
        </div>
    );
};
