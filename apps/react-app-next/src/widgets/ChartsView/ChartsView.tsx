import { useState, useEffect } from 'react';
import {
    Flex,
    SegmentedRadioGroup,
} from "@gravity-ui/uikit";
import block from 'bem-cn-lite';
import './ChartsView.scss';
import { ChartControls } from '@entities/Charts/ChartControls/ChartControls';
import { generateData, type ChartInputData, type ChartType } from './utils';

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

    return (
        <Flex direction="column" className={b()} gap={3}>
            <Flex>
                <SegmentedRadioGroup
                    name="chartType"
                    value={selectedType}
                    onChange={(e) => {setSelectedType(e.target.value as ChartType);}}
                    size="m"
                    width='auto'
                >
                    {options}
                </SegmentedRadioGroup>
            </Flex>

            {/* <DataFilters /> */}

            <ChartControls type={selectedType} chartData={chartData} />
        </Flex>
    );
};
