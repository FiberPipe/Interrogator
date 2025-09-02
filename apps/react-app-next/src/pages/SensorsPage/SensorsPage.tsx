import { useState } from 'react';
import {
    Flex,
    SegmentedRadioGroup,
} from "@gravity-ui/uikit";
import block from 'bem-cn-lite';

import { ChartType } from '@shared/types/charts';

import './SensorsPage.scss';
import { SensorDataView } from '@widgets/SensorDataView';

const b = block('charts-page');

const options: { key: ChartType, name: string }[] = [
    { key: "acqusition", name: "Acqusition" },
    { key: "power", name: "Power" },
    { key: "displacement", name: "Displacement" },
    { key: "wavelength", name: "Wavelength" },
    { key: "fbg", name: "FBG" },
    { key: "temperature", name: "Temperature" },
];

export const ChartsPage = () => {
    const [selectedType, setSelectedType] = useState<ChartType>("acqusition");

    return (
        <Flex direction="column" gap={3} className={b()}>
            <Flex width="auto" direction="row" justifyContent="space-between">
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
            <SensorDataView type={selectedType} />
        </Flex>
    );
};
