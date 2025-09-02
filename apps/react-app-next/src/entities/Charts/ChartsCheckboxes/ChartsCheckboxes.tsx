import { Checkbox, Flex, Button } from "@gravity-ui/uikit";

interface ChartsCheckboxesProps {
    params: number[];
    enabled: number[];
    onChangeUpdate: (index: number) => void;
    onEnableAll: () => void;
    onDisableAll: () => void;
}

export const ChartCheckboxes = ({
    params,
    enabled,
    onChangeUpdate,
    onEnableAll,
    onDisableAll,
}: ChartsCheckboxesProps) => {
    const isDisabled = !params || params.length === 0;

    return (
        <Flex gap={4} direction="column">
            <Flex gap={2}>
                <Button
                    size="s"
                    view="outlined"
                    onClick={onEnableAll}
                    disabled={isDisabled}
                >
                    Включить все
                </Button>
                <Button
                    size="s"
                    view="outlined"
                    onClick={onDisableAll}
                    disabled={isDisabled}
                >
                    Выключить все
                </Button>
            </Flex>

            {params.map((channelIdx) => (
                <Checkbox
                    key={`P${channelIdx}`}
                    content={`P${channelIdx}`}
                    checked={enabled.includes(channelIdx)}
                    onChange={() => onChangeUpdate(channelIdx)}
                    disabled={isDisabled}
                />
            ))}
        </Flex>
    );
};
