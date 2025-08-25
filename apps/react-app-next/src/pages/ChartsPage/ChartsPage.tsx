import { useState } from 'react';
import {
    Flex,
    SegmentedRadioGroup,
} from "@gravity-ui/uikit";
import block from 'bem-cn-lite';

import { SensorChartData } from '@features/SensorChartData';
import { ChartType } from '@shared/types/charts';

import './ChartsPage.scss';

const b = block('charts-view');

const options = [
    { key: "acqusition", name: "Acqusition" },
    { key: "power", name: "Power" },
    { key: "displacement", name: "Displacement" },
    { key: "temperature", name: "Temperature" },
];

export const ChartsPage = () => {
    const [selectedType, setSelectedType] = useState<ChartType>("acqusition"); // по умолчанию

    return (
        <Flex direction="column" className={b()} gap={3}>
            <Flex>
                <SegmentedRadioGroup
                    name="chartType"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as ChartType)}
                    defaultValue="acqusition"
                    size="m"
                    width="auto"
                >
                    {options.map(({ key, name }) => (
                        <SegmentedRadioGroup.Option key={key} value={key}>
                            {name}
                        </SegmentedRadioGroup.Option>
                    ))}
                </SegmentedRadioGroup>
            </Flex>
            <Flex className={b('chart')}>
                <SensorChartData type={selectedType} />
            </Flex>
        </Flex>
    );
};
