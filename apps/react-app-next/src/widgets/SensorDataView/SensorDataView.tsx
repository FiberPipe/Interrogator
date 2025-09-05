import { useMemo, useState, useEffect } from "react";
import { Flex, SegmentedRadioGroup } from "@gravity-ui/uikit";
import block from "bem-cn-lite";
import "./SensorDataView.scss";

import { ChartType } from "@shared/types/charts";
import { SensorChartData } from "@features/SensorChartData";
import { VIEW_RULES } from "@shared/config/view-rules";
import { SensorDataTable } from "@features/SensorDataTable/SensorDataTable";

const b = block("sensor-data-view");

interface SensorDataViewProps {
    type: ChartType;
}

type ChartView = "chart" | "table";

export const SensorDataView = ({ type }: SensorDataViewProps) => {
    const [view, setView] = useState<ChartView>("chart");

    const availableViews = useMemo(() => VIEW_RULES[type] ?? [], [type]);

    useEffect(() => {
        if (availableViews.length === 1) {
            setView(availableViews[0]);
        } else if (!availableViews.includes(view)) {
            setView(availableViews[0]);
        }
    }, [availableViews, view]);

    return (
        <Flex className={b()} direction="column" gap={3}>
            <Flex className={b('view')}>
                {availableViews.length > 1 && (<SegmentedRadioGroup
                    name="viewMode"
                    value={view}
                    onChange={(e) => setView(e.target.value as ChartView)}
                    size="m"
                    width="auto"
                >
                    {availableViews.map((mode) => (
                        <SegmentedRadioGroup.Option key={mode} value={mode}>
                            {mode === "chart" ? "График" : "Таблица"}
                        </SegmentedRadioGroup.Option>
                    ))}
                </SegmentedRadioGroup>)}
            </Flex>
            {view === 'chart' ? <SensorChartData type={type} /> : <SensorDataTable type={type} />}

        </Flex>
    );
};
