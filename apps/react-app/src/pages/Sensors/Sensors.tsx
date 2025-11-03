"use client";

import { Tab, Tabs, Button, ButtonGroup } from "@heroui/react";
import { useState } from "react";
import { SensorMetric } from "../../shared";
import { DataTable } from "../../features/tables";
import { DataCharts } from "../../features";

const SENSOR_METRIC: SensorMetric[] = ["Wavelength", "Power", "Temperature", "Displacement"];

export const SensorsPage = () => {
    const [viewMode, setViewMode] = useState<"chart" | "table">("chart");

    return (
        <div className="w-full">
            <div className="mx-auto p-6">
                <Tabs aria-label="Sensor Data Tabs" variant="bordered" color="primary">
                    {SENSOR_METRIC.map((sensorType: SensorMetric) => (
                        <Tab key={sensorType.toLowerCase()} title={sensorType}>
                            <div className="w-full">
                                <div className="flex justify-end mb-3">
                                    <ButtonGroup size="sm" radius="full" variant="flat">
                                        <Button
                                            color={viewMode === "chart" ? "primary" : "default"}
                                            onPress={() => setViewMode("chart")}
                                        >
                                            Chart
                                        </Button>
                                        <Button
                                            color={viewMode === "table" ? "primary" : "default"}
                                            onPress={() => setViewMode("table")}
                                        >
                                            Table
                                        </Button>
                                    </ButtonGroup>
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
