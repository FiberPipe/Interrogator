import { useGetSensorChartData } from "./useGetSensorChartData";
import { ChartType } from "@shared/types/charts";
import { useInputStore } from "@shared/store";
import { useState, useMemo, useEffect } from "react";
import { Flex } from "@gravity-ui/uikit";
import block from "bem-cn-lite";
import "./SensorChartData.scss";
import { ChartCheckboxes, LineChart } from "@entities/Charts";

const b = block("sensor-chart-data");

interface SensorChartDataProps {
    type: ChartType;
}

export const SensorChartData = ({ type }: SensorChartDataProps) => {
    const { filePaths } = useInputStore();
    const { sensorDataFilePath = "" } = filePaths ?? {};

    // теперь получаем всё из хука
    const { chartData, maxChannels } = useGetSensorChartData({
        type,
        sensorDataFilePath,
    });

    const [enabledChannels, setEnabledChannels] = useState<number[]>([]);

    const [initialized, setInitialized] = useState(false);

    // инициализация каналов при первой загрузке
    useEffect(() => {
        if (maxChannels > 0 && !initialized) {
            setEnabledChannels(Array.from({ length: maxChannels }, (_, i) => i));
            setInitialized(true);
        }
    }, [maxChannels, initialized]);

    const handleChannelToggle = (channelIdx: number) => {
        setEnabledChannels((prev) =>
            prev.includes(channelIdx)
                ? prev.filter((c) => c !== channelIdx)
                : [...prev, channelIdx]
        );
    };

    const handleEnableAll = () => {
        setEnabledChannels(Array.from({ length: maxChannels }, (_, i) => i));
    };

    const handleDisableAll = () => {
        setEnabledChannels([]);
    };

    const filteredChartData = useMemo(() => {
        return chartData.filter((line) => {
            const match = line.id.match(/Ch-(\d+)/);
            if (!match) return false;
            const channelIdx = Number(match[1]);
            return enabledChannels.includes(channelIdx);
        });
    }, [chartData, enabledChannels]);

    return (
        <div className={b()}>
            <Flex className={b("chart")}>
                <LineChart data={filteredChartData} />
            </Flex>

            {maxChannels > 0 && (
                <Flex className={b("checkboxes")}>
                    <ChartCheckboxes
                        params={Array.from({ length: maxChannels }, (_, i) => i)}
                        enabled={enabledChannels}
                        onChangeUpdate={handleChannelToggle}
                        onEnableAll={handleEnableAll}
                        onDisableAll={handleDisableAll}
                    />
                </Flex>
            )}
        </div>
    );
};
