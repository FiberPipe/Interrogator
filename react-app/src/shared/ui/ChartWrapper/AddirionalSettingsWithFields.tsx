"use client";

import { useState } from "react";
import { Input, Button} from "@heroui/react";
import { AutoOrNum } from "./ChartWrapper";
import { FieldSelector } from "../../../entities";

interface AdditionalSettingsProps {
    confidenceLayer: AutoOrNum;
    setConfidenceLayer: (value: AutoOrNum) => void;
    dataObject: Record<string, any>;
    prefix: string;
}

export const AdditionalSettingsWithFields = ({
    confidenceLayer,
    setConfidenceLayer,
    dataObject,
    prefix,
}: AdditionalSettingsProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const parseNumber = (val: string): number | "auto" => {
        if (val.trim() === "") return "auto";
        const num = Number(val);
        return isNaN(num) ? "auto" : num;
    };

    return (
        <div className="flex flex-col gap-3">
            <Input
                size="sm"
                type="number"
                placeholder="CI"
                description="Доверительный интервал"
                value={confidenceLayer === "auto" ? "" : String(confidenceLayer)}
                onChange={(e) => setConfidenceLayer(parseNumber(e.target.value))}
            />

            <div className="flex flex-col border border-default-200 rounded-md bg-content2">
                <Button
                    size="sm"
                    variant="flat"
                    onPress={() => setIsOpen((prev) => !prev)}
                >
                    {isOpen ? "Скрыть выбор полей" : "Показать выбор полей"}
                </Button>

                {isOpen && (
                    <div className="p-2">
                        <FieldSelector
                            dataObject={dataObject}
                            prefix={prefix}
                            title="Выбор полей"
                            maxColumns={4}
                            defaultSelected={[]}
                            onChange={(selected) => console.log("Selected fields:", selected)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
