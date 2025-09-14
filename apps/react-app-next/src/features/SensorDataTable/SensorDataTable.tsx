import { ChartType } from "@shared/types/charts";
import { useGetDataTable } from "./useGetDataTable";
import { Flex } from "@gravity-ui/uikit";
import { FBGDataTable, WLTable, TemperatureTable } from "@entities/Tables";

export const SensorDataTable = ({ type }: { type: ChartType }) => {
    const { tableData, handleInputChange, inputs } = useGetDataTable(type);

    return (
        <Flex direction={"column"}>
            {type === "fbg" ? <FBGDataTable data={tableData} handleInputChange={handleInputChange} inputs={inputs}/> : null}
            {type === "wavelength" ? <WLTable data={tableData} handleInputChange={handleInputChange} inputs={inputs}/> : null}
            {type === "temperature" ? <TemperatureTable data={tableData} handleInputChange={handleInputChange} inputs={inputs}/> : null}
        </Flex>
    )
}