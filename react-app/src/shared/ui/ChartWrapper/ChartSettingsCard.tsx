"use client";

import { Card, CardHeader, CardBody, Chip } from "@heroui/react";
import { ScaleControls } from "./ScaleControls";
import { AutoOrNum } from "./ChartWrapper";
import { AdditionalSettingsWithFields } from "./AddirionalSettingsWithFields";

interface Props {
    autoY: boolean;
    onAutoYChange: (on: boolean) => void;
    yMin: AutoOrNum;
    yMax: AutoOrNum;
    setYMin: (v: AutoOrNum) => void;
    setYMax: (v: AutoOrNum) => void;
    confidenceLayer: AutoOrNum;
    setConfidenceLayer: (v: AutoOrNum) => void;
    onReset: () => void;
}

export const ChartSettingsCard = ({
    autoY,
    onAutoYChange,
    yMin,
    yMax,
    setYMin,
    setYMax,
    confidenceLayer,
    setConfidenceLayer,
    onReset,
}: Props) => {
    return (
        <Card className="w-full">
            <CardHeader className="justify-between">
                <div className="font-medium">Настройки графика</div>
                <div className="flex gap-2">
                    <Chip size="sm" variant="flat">
                        {autoY ? "Y: auto" : `Y: [${yMin}; ${yMax}]`}
                    </Chip>
                    <Chip size="sm" variant="flat">
                        CI: {confidenceLayer === "auto" ? "auto" : String(confidenceLayer)}
                    </Chip>
                </div>
            </CardHeader>
            <CardBody className="pt-0 flex flex-col gap-2">
                <ScaleControls
                    autoY={autoY}
                    onAutoYChange={onAutoYChange}
                    yMin={yMin}
                    yMax={yMax}
                    setYMin={setYMin}
                    setYMax={setYMax}
                    resetScales={onReset}
                />
                <AdditionalSettingsWithFields
                    confidenceLayer={confidenceLayer}
                    setConfidenceLayer={setConfidenceLayer}
                />
            </CardBody>
        </Card>
    );
};
