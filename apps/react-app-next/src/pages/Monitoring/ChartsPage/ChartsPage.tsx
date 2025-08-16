import { useState } from 'react';
import {
    Flex,
    SegmentedRadioGroup,
} from "@gravity-ui/uikit";
import block from 'bem-cn-lite';
import './ChartsPage.scss';
import { SensorChartData } from '@features/SensorChartData';
import { ChartType } from '@shared/types/charts';

const b = block('charts-view');

const options = [
    { key: "Acqusition", name: "Acqusition" },
    { key: "Power", name: "Power" },
    { key: "Displacement", name: "Displacement" },
    { key: "Temperature", name: "Temperature" },
];

export const ChartsPage = () => {
    const [selectedType, setSelectedType] = useState<ChartType>('Acquisition');

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
                    {options.map(({ key, name }) => <SegmentedRadioGroup.Option key={key} value={name}>{name}</SegmentedRadioGroup.Option>)}
                </SegmentedRadioGroup>
            </Flex>

            <SensorChartData type={selectedType} />
        </Flex>
    );
};
