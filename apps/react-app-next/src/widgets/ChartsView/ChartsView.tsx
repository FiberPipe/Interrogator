import { Flex, SegmentedRadioGroup } from "@gravity-ui/uikit";
import block from 'bem-cn-lite';
import './ChartsView.scss';

const b = block('charts-view');

const options = [
    <SegmentedRadioGroup.Option key="Acqusition" value="Acqusition">Acqusition</SegmentedRadioGroup.Option>,
    <SegmentedRadioGroup.Option key="Power" value="Power">Power</SegmentedRadioGroup.Option>,
    <SegmentedRadioGroup.Option key="Displacement" value="Displacement">Displacement</SegmentedRadioGroup.Option>,
];


export const ChartsView = () => {
    return (
        <Flex direction="column" className={b()}>
            <SegmentedRadioGroup name="group2" defaultValue="Acqusition" size="m">{options}</SegmentedRadioGroup>
        </Flex>
    )

}