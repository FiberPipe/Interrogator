import { useGetSensorChartData } from "./useGetSensorChartData";
import { ChartType } from "@shared/types/charts";
import { useInputStore } from "@shared/store";
import { useState, useMemo, useEffect } from "react";
import { Flex, Text } from "@gravity-ui/uikit";
import block from "bem-cn-lite";
import "./SensorChartData.scss";
import { BarChart, ChartCheckboxes, LineChart } from "@entities/Charts";
import { ChartWrapper } from "@entities/Charts/ChartWrapper";

const b = block("sensor-chart-data");

interface SensorChartDataProps {
    type: ChartType;
}

export const SensorChartData = ({ type }: SensorChartDataProps) => {
    const { filePaths } = useInputStore();
    const { sensorDataFilePath = "" } = filePaths ?? {};

    const { chartData, maxChannels } = useGetSensorChartData({
        type,
        sensorDataFilePath,
    });

    const [enabledChannels, setEnabledChannels] = useState<number[]>([]);
    const [initialized, setInitialized] = useState(false);

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
        if (type === "wavelength" || type === "displacement") {
            return chartData; // один канал → без фильтрации
        }

        return chartData.filter((line) => {
            const match = line.id.match(/Ch-(\d+)/);
            if (!match) return false;
            const channelIdx = Number(match[1]);
            return enabledChannels.includes(channelIdx);
        });
    }, [chartData, enabledChannels, type]);

    return (
        <div className={b()}>
            <Flex className={b("chart")} alignItems="center" justifyContent="center">
                {!sensorDataFilePath ? (
                    <Flex className={b("placeholder")} direction="column" gap={3}>
                        <Text color="secondary" variant="subheader-2">
                            Файл с данными не подключен
                        </Text>
                        <Text color="secondary" variant="body-1">
                            Перейдите в настройки, чтобы загрузить данные
                        </Text>
                    </Flex>
                ) :
                    <ChartWrapper type={type} data={filteredChartData} />
                }
            </Flex>

            <Flex className={b("checkboxes")}>
                <ChartCheckboxes
                    params={Array.from({ length: maxChannels }, (_, i) => i)}
                    enabled={enabledChannels}
                    onChangeUpdate={handleChannelToggle}
                    onEnableAll={handleEnableAll}
                    onDisableAll={handleDisableAll}
                />
            </Flex>
        </div>
    );
};
