"use client";

import { Tab, Tabs, Button } from "@heroui/react";
import { useState } from "react";
import { SensorMetric } from "../../shared";
import { DataTable } from "../../features/tables";
import { DataCharts } from "../../features";

const SENSOR_METRIC: SensorMetric[] = [
    "Wavelength",
    "Power",
    "Temperature",
    "Displacement",
];

export const SensorsPage = () => {
    const [viewMode, setViewMode] = useState<"chart" | "table">("chart");

    return (
        <div className="flex flex-col w-full p-6 gap-4">
            <div className="flex-1 min-h-0">
                <Tabs
                    aria-label="Sensor Data Tabs"
                    variant="bordered"
                    color="primary"
                    className="h-full"
                >
                    {SENSOR_METRIC.map((sensorType: SensorMetric) => (
                        <Tab key={sensorType.toLowerCase()} title={sensorType}>
                            <div className="w-full h-full p-4 gap-4">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        size="sm"
                                        color={viewMode === "chart" ? "primary" : "default"}
                                        onPress={() => setViewMode("chart")}
                                    >
                                        Chart
                                    </Button>
                                    <Button
                                        size="sm"
                                        color={viewMode === "table" ? "primary" : "default"}
                                        onPress={() => setViewMode("table")}
                                    >
                                        Table
                                    </Button>
                                </div>
                                {viewMode === "chart" ? (
                                    <DataCharts sensorType={sensorType} />
                                ) : (
                                    <DataTable sensorType={sensorType} />
                                )}
                            </div>
                        </Tab>
                    ))}
                </Tabs>
            </div>
        </div>
    );
};
