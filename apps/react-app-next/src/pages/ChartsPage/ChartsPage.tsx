import { useState } from 'react';
import {
    Flex,
    RadioGroup,
    SegmentedRadioGroup,
} from "@gravity-ui/uikit";
import block from 'bem-cn-lite';

import { SensorChartData } from '@features/SensorChartData';
import { ChartType } from '@shared/types/charts';

import './ChartsPage.scss';
import { SensorDataTable } from '@features/SensorDataTable/SensorDataTable';

const b = block('charts-view');

const options = [
    { key: "acqusition", name: "Acqusition" },
    { key: "power", name: "Power" },
    { key: "displacement", name: "Displacement" },
    { key: "wavelength", name: "Wavelength" },
];

const optionsRadio = [
    { value: 'graph', content: 'График' },
    { value: 'table', content: 'Таблица' },
];

export const ChartsPage = () => {
    const [selectedType, setSelectedType] = useState<ChartType>("acqusition");
    const [selectedView, setSelectedView] = useState<"graph" | 'table'>("graph");

    return (
        <Flex direction="column" className={b()} gap={3}>
            <Flex width="max" direction="row" justifyContent="space-between">
                <SegmentedRadioGroup
                    name="chartView"
                    value={selectedView}
                    onChange={(e) => setSelectedView(e.target.value as "graph" | "table")}
                    size="m"
                >
                    {optionsRadio.map(({ value, content }) => (
                        <SegmentedRadioGroup.Option key={value} value={value}>
                            {content}
                        </SegmentedRadioGroup.Option>
                    ))}
                </SegmentedRadioGroup>

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
                {selectedView === 'graph' ? <SensorChartData type={selectedType} /> : <SensorDataTable type={selectedType} />}
            </Flex>
        </Flex>
    );
};
