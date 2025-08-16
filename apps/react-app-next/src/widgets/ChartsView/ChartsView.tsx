import { useState, useEffect } from 'react';
import {
    Flex,
    Icon,
    SegmentedRadioGroup,
} from "@gravity-ui/uikit";
import block from 'bem-cn-lite';
import './ChartsView.scss';
import { ChartControls } from '@entities/Charts/ChartControls/ChartControls';
import { generateData, type ChartInputData, type ChartType } from './utils';
import { LayoutCells, ChartLine } from '@gravity-ui/icons';
import { DataFilters } from '@shared/ui/DataFilter/DataFilter';

const b = block('charts-view');

const options = [
    <SegmentedRadioGroup.Option key="Acquisition" value="Acquisition">Acquisition</SegmentedRadioGroup.Option>,
    <SegmentedRadioGroup.Option key="Power" value="Power">Power</SegmentedRadioGroup.Option>,
    <SegmentedRadioGroup.Option key="Displacement" value="Displacement">Displacement</SegmentedRadioGroup.Option>,
    <SegmentedRadioGroup.Option key="Temperature" value="Temperature">Temperature</SegmentedRadioGroup.Option>,
];

export const ChartsView = () => {
    const [selectedType, setSelectedType] = useState<ChartType>('Acquisition');
    const [chartData, setChartData] = useState<ChartInputData>({ data: [], unit: 'Acquisition' });

    useEffect(() => {
        const newData = generateData(selectedType);
        setChartData(newData);
    }, [selectedType]);

    const options2 = [
        <SegmentedRadioGroup.Option key="Table" value="Table">
            <Icon data={LayoutCells} size={16} />
            Table
        </SegmentedRadioGroup.Option>,
        <SegmentedRadioGroup.Option key="Graph" value="Graph">
            <Icon data={ChartLine} size={16} />
            Graph
        </SegmentedRadioGroup.Option>,
    ];



    return (
        <Flex direction="column" className={b()} gap={3}>
            <Flex>
                <SegmentedRadioGroup
                    name="chartType"
                    value={selectedType}
                    onChange={(e) => { setSelectedType(e.target.value as ChartType); }}
                    size="m"
                    width='auto'
                >
                    {options}
                </SegmentedRadioGroup>
            </Flex>

            <Flex>
                <SegmentedRadioGroup name="View" defaultValue="Graph" size="s">{options2}</SegmentedRadioGroup>
            </Flex>


            <ChartControls type={selectedType} chartData={chartData} />
        </Flex>
    );
};
