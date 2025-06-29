import React, { useState, useEffect } from "react";
import { Button, Input } from "@nextui-org/react";

interface RangeControlProps {
    initialMin: number;
    initialMax: number;
    onRangeChange: (min: number, max: number) => void;
    isInitialized: boolean;
}

export const RangeControl: React.FC<RangeControlProps> = ({
    initialMin,
    initialMax,
    onRangeChange,
    isInitialized
}) => {
    const [tempMin, setTempMin] = useState<number>(initialMin);
    const [tempMax, setTempMax] = useState<number>(initialMax);

    useEffect(() => {
        if (isInitialized) {
            setTempMin(initialMin);
            setTempMax(initialMax);
        }
    }, [initialMin, initialMax, isInitialized]);

    const handleMinChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number.parseFloat(event.target.value);
        if (!isNaN(value)) {
            setTempMin(value);
        }
    };

    const handleMaxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number.parseFloat(event.target.value);
        if (!isNaN(value)) {
            setTempMax(value);
        }
    };

    const applyRange = () => {
        if (tempMin < tempMax) {
            onRangeChange(tempMin, tempMax);
        } else {
            alert("Минимальное значение должно быть меньше максимального.");
        }
    };

    return (
        <div className="flex flex-row gap-2 w-40">
            <div className="m">
                <Input
                    label="min"
                    value={isInitialized ? tempMin.toFixed(2) : "0.00"}
                    onChange={handleMinChange}
                    size="sm"
                    type="text"
                    style={{ marginLeft: 5, width: 80, marginTop: 10 }}
                />
            </div>
            <div>
                <Input
                    label="max"
                    value={isInitialized ? tempMax.toFixed(2) : "10.00"}
                    onChange={handleMaxChange}
                    size="sm"
                    type="text"
                    style={{ marginLeft: 5, width: 80, marginTop: 10 }}
                />
            </div>
            <Button onClick={applyRange} color="primary" style={{ padding: 10 }}>
                Применить
            </Button>
        </div>
    );
};
