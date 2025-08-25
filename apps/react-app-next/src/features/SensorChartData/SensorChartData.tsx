import { useGetSensorChartData } from "./useGetSensorChartData";
import { ChartType } from "@shared/types/charts";
import { useInputStore } from "@shared/store";
import { useState, useMemo, useEffect } from "react";
import { Alert, Flex } from "@gravity-ui/uikit";
import block from "bem-cn-lite";
import "./SensorChartData.scss";
import { BarChart, ChartCheckboxes, LineChart } from "@entities/Charts";
import { useNavigate } from "react-router-dom";

const b = block("sensor-chart-data");

interface SensorChartDataProps {
    type: ChartType;
}

export const SensorChartData = ({ type }: SensorChartDataProps) => {
    const { filePaths } = useInputStore();
    const { sensorDataFilePath = "" } = filePaths ?? {};

    const navigate = useNavigate();

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
            {!sensorDataFilePath && (
                <Alert
                    layout="horizontal"
                    title="Не подключен файл с данными"
                    message="Перейдите в настройки, чтобы подключить"
                    theme="warning"
                    actions={
                        <Alert.Action onClick={() => navigate("/settings")}>
                            Подключить
                        </Alert.Action>
                    }
                />
            )}

            <Flex className={b("chart")}>
                {type === "acqusition" ? (
                    <BarChart data={chartData} />
                ) : (
                    <LineChart data={filteredChartData} />
                )}
            </Flex>

            {maxChannels > 0 && type === "power" && (
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
