import { ChartType } from "@shared/types/charts";
import { useGetDataTable } from "./useGetDataTable";
import { FBGDataTable, WLTable } from "@entities/Tables";
import { Flex } from "@gravity-ui/uikit";

export const SensorDataTable = ({ type }: { type: ChartType }) => {
    const { tableData, handleInputChange, inputs } = useGetDataTable(type);

    return (
        <Flex>
            {type === "fbg" ? <FBGDataTable data={tableData} handleInputChange={handleInputChange} inputs={inputs}/> : null}
            {type === "wavelength" ? <WLTable data={tableData} handleInputChange={handleInputChange} inputs={inputs}/> : null}
        </Flex>
    )
}