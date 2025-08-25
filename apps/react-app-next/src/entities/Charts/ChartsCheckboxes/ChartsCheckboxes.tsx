import { Checkbox, Flex, Button } from "@gravity-ui/uikit";

interface ChartsCheckboxesProps {
    params: number[];              // список каналов, например [0,1,2,3]
    enabled: number[];             // активные каналы
    onChangeUpdate: (index: number) => void;
    onEnableAll: () => void;       // включить все
    onDisableAll: () => void;      // выключить все
}

export const ChartCheckboxes = ({ params, enabled, onChangeUpdate, onEnableAll, onDisableAll }: ChartsCheckboxesProps) => {
    return (
        <Flex gap={4} direction="column">
            <Flex gap={2}>
                <Button size="s" view="outlined" onClick={onEnableAll}>
                    Включить все
                </Button>
                <Button size="s" view="outlined" onClick={onDisableAll}>
                    Выключить все
                </Button>
            </Flex>

            {params.map((channelIdx) => (
                <Checkbox
                    key={`P${channelIdx}`}
                    content={`P${channelIdx}`}
                    checked={enabled.includes(channelIdx)}
                    onChange={() => onChangeUpdate(channelIdx)}
                />
            ))}
        </Flex>
    );
};
