import { DisplacementTable, PowerTable, TemperatureTable, WavelengthTable } from "../../../entities";
import { SensorMetric } from "../../../shared";
import { usePollingData } from "../../hooks/usePollingData";
import { useInputs } from "../useInputs";

interface DataTableProps {
    sensorType: SensorMetric;
}

export const DataTable = ({ sensorType }: DataTableProps) => {
    const { inputValues, handleInputChange } = useInputs()
    const { data } = usePollingData();

    return (
        <>
            {sensorType === 'Wavelength' ? <WavelengthTable body={data} inputValues={inputValues} handleInputChange={handleInputChange} /> : null}
            {sensorType === 'Displacement' ? <DisplacementTable body={data} inputValues={inputValues} handleInputChange={handleInputChange} /> : null}
            {sensorType === 'Power' ? <PowerTable body={data} inputValues={inputValues} handleInputChange={handleInputChange} /> : null}
            {sensorType === 'Temperature' ? <TemperatureTable body={data} inputValues={inputValues} handleInputChange={handleInputChange} /> : null}
        </>
    )
}