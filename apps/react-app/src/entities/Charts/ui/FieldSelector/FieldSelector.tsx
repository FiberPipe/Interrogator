"use client";

import React, { useMemo, useState } from "react";
import {
    Checkbox,
    CheckboxGroup,
    Card,
    CardBody,
    CardHeader,
    Button,
} from "@heroui/react";
import clsx from "clsx";

interface FieldSelectorProps {
    dataObject: Record<string, any>;
    prefix: string;
    onChange?: (selected: string[]) => void;
    defaultSelected?: string[];
    title?: string;
    maxColumns?: 2 | 3 | 4 | 5 | 6;
}

export const FieldSelector: React.FC<FieldSelectorProps> = ({
    dataObject,
    prefix,
    onChange,
    defaultSelected = [],
    title = "Выбор полей",
    maxColumns = 4,
}) => {
    const [selected, setSelected] = useState<string[]>(defaultSelected);

    const fieldKeys = useMemo(
        () =>
            Object.keys(dataObject ?? {})
                .filter((key) => key.startsWith(prefix))
                .sort((a, b) => {
                    const numA = parseInt(a.replace(/\D+/g, ""), 10);
                    const numB = parseInt(b.replace(/\D+/g, ""), 10);
                    return numA - numB;
                }),
        [dataObject, prefix]
    );

    const handleChange = (newSelected: string[]) => {
        setSelected(newSelected);
        onChange?.(newSelected);
    };

    const handleSelectAll = () => {
        setSelected(fieldKeys);
        onChange?.(fieldKeys);
    };

    const handleClearAll = () => {
        setSelected([]);
        onChange?.([]);
    };

    const gridColsMap: Record<number, string> = {
        2: "grid-cols-2",
        3: "grid-cols-3",
        4: "grid-cols-4",
        5: "grid-cols-5",
        6: "grid-cols-6",
    };
    const gridCols = gridColsMap[Math.min(Math.max(maxColumns, 2), 6)];

    return (
        <Card
            variant="flat"
            className="w-full bg-content2 border border-default-200"
            shadow="sm"
        >
            <CardHeader className="flex justify-between items-center py-3">
                <div className="flex items-center gap-2">
                    <span className="font-medium">{title}</span>
                    <span className="text-default-500 text-small">
                        {selected.length}/{fieldKeys.length}
                    </span>
                </div>
                <div className="flex gap-2">
                    <Button size="sm" variant="flat" color="success" onPress={handleSelectAll}>
                        Выбрать все
                    </Button>
                    <Button size="sm" variant="flat" color="danger" onPress={handleClearAll}>
                        Очистить
                    </Button>
                </div>
            </CardHeader>

            <CardBody className="pt-0 pb-3">
                {fieldKeys.length === 0 ? (
                    <div className="text-default-500 text-small">
                        Поля с префиксом “{prefix}” не найдены
                    </div>
                ) : (
                    <CheckboxGroup
                        aria-label={`Поля с префиксом ${prefix}`}
                        value={selected}
                        onChange={handleChange}
                    >
                        <div
                            className={clsx(
                                "grid gap-2",
                                "sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6", // адаптивно
                                gridCols // и фикс верхний предел, если нужен
                            )}
                        >
                            {fieldKeys.map((key) => (
                                <Checkbox key={key} value={key} size="sm" radius="sm">
                                    {key}
                                </Checkbox>
                            ))}
                        </div>
                    </CheckboxGroup>
                )}
            </CardBody>
        </Card>
    );
};
