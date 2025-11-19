"use client";

import React, { useMemo, useRef, useState } from "react";
import { FieldSelector, PowerChart, WavelengthChart } from "../../../entities";
import { AutoOrNum, ChartWrapper, ChartWrapperControls, ReceivedData, SensorMetric } from "../../../shared";
import { usePollingData } from "../../hooks/usePollingData";
import { Card, CardBody } from "@heroui/react";
import { ChartSettingsCard } from "../../../shared/ui/ChartWrapper/ChartSettingsCard";

interface DataChartsProps {
    sensorType: SensorMetric;
}

export const DataCharts: React.FC<DataChartsProps> = ({ sensorType }) => {
    const { data } = usePollingData();

    const prefix = useMemo(() => {
        switch (sensorType) {
            case "Power":
                return "P";
            case "Wavelength":
                return "wavelength";
            case "Displacement":
                return "wavelength";
            default:
                return "";
        }
    }, [sensorType]);

    const [selectedFields, setSelectedFields] = useState<string[]>([]);
    const sampleObject = data && data.length > 0 ? data[0] : {};

    const filteredData = useMemo(() => {
        if (!data || !Array.isArray(data)) return [];
        if (selectedFields.length === 0) return data;

        return data.map((record: ReceivedData) => {
            const filtered: ReceivedData = {} as ReceivedData;
            Object.keys(record).forEach((key) => {
                if (selectedFields.includes(key) || key === "time" || key === "id_record") {
                    // @ts-ignore
                    filtered[key] = record[key];
                }
            });
            return filtered;
        });
    }, [data, selectedFields]);

    // Подсчет диапазона значений (для отключения авто)
    const dataExtent = useMemo(() => {
        let min = Infinity;
        let max = -Infinity;
        for (const r of filteredData) {
            for (const [k, v] of Object.entries(r)) {
                if (k === "time" || k === "id_record") continue;
                if (typeof v === "number" && isFinite(v)) {
                    if (v < min) min = v;
                    if (v > max) max = v;
                }
            }
        }
        if (!isFinite(min) || !isFinite(max)) return null;
        const pad = Math.max((max - min) * 0.02, max === min ? 1 : 0);
        return { min: min - pad, max: max + pad };
    }, [filteredData]);

    // Состояния управления графиком
    const [autoY, setAutoY] = useState(true);
    const [yMin, setYMin] = useState<AutoOrNum>("auto");
    const [yMax, setYMax] = useState<AutoOrNum>("auto");
    const [confidenceLayer, setConfidenceLayer] = useState<AutoOrNum>(0);
    const lastManualMin = useRef<number | null>(null);
    const lastManualMax = useRef<number | null>(null);

    const setYMinManual = (v: AutoOrNum) => {
        setYMin(v);
        if (typeof v === "number") {
            lastManualMin.current = v;
            if (autoY) setAutoY(false);
        }
    };
    const setYMaxManual = (v: AutoOrNum) => {
        setYMax(v);
        if (typeof v === "number") {
            lastManualMax.current = v;
            if (autoY) setAutoY(false);
        }
    };

    const handleAutoYChange = (on: boolean) => {
        setAutoY(on);
        if (on) {
            setYMin("auto");
            setYMax("auto");
        } else {
            const min = lastManualMin.current ?? dataExtent?.min ?? 0;
            const max = lastManualMax.current ?? dataExtent?.max ?? 1;
            setYMin(min);
            setYMax(max);
        }
    };

    const resetScales = () => {
        setAutoY(true);
        setYMin("auto");
        setYMax("auto");
        setConfidenceLayer(0);
    };

    const hasData = Array.isArray(filteredData) && filteredData.length > 0;

    const controls: ChartWrapperControls = {
        autoY,
        yMin,
        yMax,
        setYMin: setYMinManual,
        setYMax: setYMaxManual,
        confidenceLayer,
        onReset: resetScales,
    };

    return (
        <div className="w-full">
            <div className="mx-auto"> {/* общий контейнер страницы */}
                <div className="grid grid-cols-12 gap-4 items-start">

                    <main className="col-span-12 md:col-span-6">
                        <div className="w-full flex justify-center">
                            <Card className="w-full max-w-5xl">
                                <CardBody className="p-3 md:p-4">
                                    {!hasData ? (
                                        <div className="h-64 w-full flex items-center justify-center text-default-500">
                                            Нет данных для отображения
                                        </div>
                                    ) : (
                                        <div className="w-full h-[65vh]">
                                            <ChartWrapper {...controls}>
                                                {sensorType === "Wavelength" && (
                                                    <WavelengthChart data={filteredData} />
                                                )}
                                                {sensorType === "Power" && (
                                                    <PowerChart data={filteredData} />
                                                )}
                                            </ChartWrapper>
                                        </div>
                                    )}
                                </CardBody>
                            </Card>
                        </div>
                    </main>

                    <aside className="col-span-12 md:col-span-3">
                        <ChartSettingsCard
                            autoY={autoY}
                            onAutoYChange={handleAutoYChange}
                            yMin={yMin}
                            yMax={yMax}
                            setYMin={setYMinManual}
                            setYMax={setYMaxManual}
                            confidenceLayer={confidenceLayer}
                            setConfidenceLayer={setConfidenceLayer}
                            onReset={resetScales}
                        />
                    </aside>
                </div>
            </div>
        </div>
    );
};
