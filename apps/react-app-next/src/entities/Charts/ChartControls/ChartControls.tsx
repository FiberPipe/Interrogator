import { Flex, Switch, Checkbox, Button, Icon } from "@gravity-ui/uikit"
import { useState } from "react";
import { UniversalChart } from "../LineChart";
import block from 'bem-cn-lite';
import './ChartControls.scss';
import type { ChartInputData } from "@pages/Monitoring/ChartsPage/utils";
import { TrashBin } from "@gravity-ui/icons";

const b = block('chart-controls');

interface ChartControlsProps {
    chartData: ChartInputData;
}


export const ChartControls = ({ chartData }: ChartControlsProps) => {
    const [confidenceInterval, setConfidenceInterval] = useState(500);
    const [autoScale, setAutoScale] = useState(true);

    // const handleConfidenceChange = (event) => {
    //     const value = parseFloat(event.target.value);
    //     if (!isNaN(value) && value >= 0) {
    //         setConfidenceInterval(value);
    //     }
    // };

    return (
        <div className={b()}>
            <Flex className={b('chart-checkboxes-container')} direction={"column"} justifyContent={'start'} gap={2}>
                <Flex overflow="auto" direction={"column"} gap={2} className={b('chart-checkboxes')}>
                    {[1, 2, 3, 4, 5, 6, 7].map((num: number) => <Checkbox key={num} content={`Sensor ${num}`} />)}
                </Flex>
                <Flex gap={1}>
                    <Button view="normal">Добавить всё</Button>
                    <Button view={'outlined-danger'}><Icon data={TrashBin} size={16} />Очистить</Button>
                </Flex>
            </Flex>
            <Flex className={b('chart-container')}>
                <UniversalChart data={chartData.data} />
            </Flex>
            <Flex gap="1" alignItems="center" className={b('chart-controls-container')}>
                <Switch checked={autoScale} onChange={() => setAutoScale(!autoScale)} content="Auto Scale" />
            </Flex>

        </div>
    )
}